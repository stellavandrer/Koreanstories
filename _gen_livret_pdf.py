"""Écrit le Livret A1 en PDF, en préservant les images en palette indexée.

Pourquoi un écrivain de PDF maison plutôt que PyMuPDF : `insert_image()` ré-étale
toute image en RGB complet (vérifié — un PNG 64 couleurs ressortait en
« ICCBased(RGB) », 8 bits par canal). Le gain de la palette, qui est ici de 37 %,
était donc entièrement perdu à l'écriture.

Un PDF dont chaque page est une seule image plein cadre est une structure
simple, et l'écrire directement permet de garder exactement les octets produits
par l'encodeur :

  - pages plates (texte, aplats : ~5 000 couleurs) → palette indexée, flux
    Flate avec le prédicteur PNG. Sans perte visible et bien plus compact que
    du JPEG, qui dépense des octets à encoder du bruit inexistant et salit les
    contours du hangeul ;
  - pages photo (~290 000 couleurs) → JPEG, qu'une palette détruirait.

Le choix se fait page par page sur l'erreur mesurée, pas sur une supposition.
"""
import hashlib
import io
import os
import struct
import sys
import zlib

import fitz
from PIL import Image, ImageChops, ImageStat

SRC = ('/Users/justinetilleul/Desktop/DesignbyStelva/Projet perso/'
       'Korean Stories Fichier/Livret/A1/A1-koreanstories.pdf')

ERREUR_MAX = 0.8      # au-delà, une palette ne représente plus l'image
JPEG_Q = 82           # les pages photo sont rares : autant ne pas les brader


def morceaux_png(donnees):
    """Renvoie {type: [contenus]} pour les chunks d'un PNG."""
    assert donnees[:8] == b'\x89PNG\r\n\x1a\n', 'pas un PNG'
    out, i = {}, 8
    while i < len(donnees):
        taille = struct.unpack('>I', donnees[i:i + 4])[0]
        nom = donnees[i + 4:i + 8]
        out.setdefault(nom, []).append(donnees[i + 8:i + 8 + taille])
        i += 12 + taille
    return out


def encoder(page, dpi):
    """Renvoie un dict décrivant l'image de la page, prête à embarquer."""
    pm = page.get_pixmap(dpi=dpi)
    im = Image.frombytes('RGB', (pm.width, pm.height), pm.samples)

    # Du plus économe au plus fidèle : on s'arrête au premier palier qui tient.
    # Le PNG ne connaît que 1, 2, 4 et 8 bits par pixel — seule une palette de
    # 16 couleurs ou moins peut descendre à 4 bits, ce qui divise par deux les
    # octets bruts avant compression.
    for couleurs, bits in ((16, 4), (32, 8), (64, 8), (128, 8), (256, 8)):
        q = im.convert('P', palette=Image.ADAPTIVE, colors=couleurs)
        diff = ImageChops.difference(im, q.convert('RGB'))
        st = ImageStat.Stat(diff)
        err = sum(st.mean) / 3
        # L'erreur moyenne seule ne suffit pas : une page presque blanche peut
        # afficher une moyenne minuscule tout en montrant des bandes bien
        # visibles sur un aplat. On regarde donc aussi le pire pixel.
        err_max = max(st.extrema[c][1] for c in range(3))
        if err > ERREUR_MAX or err_max > 90:
            continue
        buf = io.BytesIO()
        q.save(buf, 'PNG', optimize=True, bits=bits)
        ch = morceaux_png(buf.getvalue())
        entete = ch[b'IHDR'][0]
        bits = entete[8]
        # On réutilise le flux IDAT tel quel : c'est déjà du Flate avec le
        # prédicteur PNG, que le PDF sait relire via /DecodeParms.
        return {
            'type': 'indexed',
            'w': im.width, 'h': im.height,
            'bits': bits,
            'palette': ch[b'PLTE'][0],
            'data': b''.join(ch[b'IDAT']),
        }

    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=JPEG_Q, optimize=True, progressive=False)
    return {'type': 'jpeg', 'w': im.width, 'h': im.height, 'data': buf.getvalue()}


class Pdf:
    def __init__(self):
        self.objets = [None]        # l'objet 0 n'existe pas
        self.sortie = bytearray(b'%PDF-1.5\n%\xe2\xe3\xcf\xd3\n')

    def reserver(self):
        self.objets.append(None)
        return len(self.objets) - 1

    def ecrire(self, num, corps, flux=None):
        self.objets[num] = len(self.sortie)
        self.sortie += f'{num} 0 obj\n'.encode() + corps
        if flux is not None:
            self.sortie += b'\nstream\n' + flux + b'\nendstream'
        self.sortie += b'\nendobj\n'

    def finaliser(self, racine, infos):
        debut = len(self.sortie)
        n = len(self.objets)
        self.sortie += f'xref\n0 {n}\n'.encode()
        self.sortie += b'0000000000 65535 f \n'
        for off in self.objets[1:]:
            self.sortie += f'{off:010d} 00000 n \n'.encode()
        # /Info doit être référencé ICI : sans cette entrée le dictionnaire est
        # bien présent dans le fichier mais orphelin, et aucun lecteur ne le
        # trouve. Symptôme constaté : titre vide dans Aperçu et dans Spotlight,
        # le PDF s'affichant alors sous son nom de fichier.
        # /ID est attendu par les validateurs stricts ; il identifie le fichier.
        empreinte = hashlib.md5(self.sortie[:4096] + str(n).encode()).hexdigest()
        self.sortie += (
            f'trailer\n<< /Size {n} /Root {racine} 0 R /Info {infos} 0 R '
            f'/ID [<{empreinte}> <{empreinte}>] >>\n'
            f'startxref\n{debut}\n%%EOF\n').encode()
        return bytes(self.sortie)


def construire(dpi, pages=None, sortie=None, bavard=False):
    src = fitz.open(SRC)
    indices = list(pages) if pages is not None else list(range(src.page_count))

    pdf = Pdf()
    num_catalogue = pdf.reserver()
    num_pages = pdf.reserver()
    refs_pages, stats = [], {'indexed': 0, 'jpeg': 0}

    for n, i in enumerate(indices):
        page = src[i]
        larg, haut = page.rect.width, page.rect.height
        img = encoder(page, dpi)
        stats[img['type']] += 1

        num_img = pdf.reserver()
        num_contenu = pdf.reserver()
        num_page = pdf.reserver()
        refs_pages.append(num_page)

        if img['type'] == 'indexed':
            n_couleurs = len(img['palette']) // 3
            espace = (f"[/Indexed /DeviceRGB {n_couleurs - 1} "
                      f"<{img['palette'].hex()}>]")
            dico = (
                f"<< /Type /XObject /Subtype /Image /Width {img['w']} "
                f"/Height {img['h']} /ColorSpace {espace} "
                f"/BitsPerComponent {img['bits']} /Filter /FlateDecode "
                f"/DecodeParms << /Predictor 15 /Colors 1 "
                f"/BitsPerComponent {img['bits']} /Columns {img['w']} >> "
                f"/Length {len(img['data'])} >>"
            ).encode()
        else:
            dico = (
                f"<< /Type /XObject /Subtype /Image /Width {img['w']} "
                f"/Height {img['h']} /ColorSpace /DeviceRGB "
                f"/BitsPerComponent 8 /Filter /DCTDecode "
                f"/Length {len(img['data'])} >>"
            ).encode()
        pdf.ecrire(num_img, dico, img['data'])

        contenu = zlib.compress(
            f'q {larg:.4f} 0 0 {haut:.4f} 0 0 cm /Im0 Do Q'.encode(), 9)
        pdf.ecrire(num_contenu,
                   f'<< /Length {len(contenu)} /Filter /FlateDecode >>'.encode(),
                   contenu)

        pdf.ecrire(num_page, (
            f'<< /Type /Page /Parent {num_pages} 0 R '
            f'/MediaBox [0 0 {larg:.4f} {haut:.4f}] '
            f'/Resources << /XObject << /Im0 {num_img} 0 R >> >> '
            f'/Contents {num_contenu} 0 R >>').encode())

        if bavard and (n + 1) % 20 == 0:
            print(f'  {n + 1}/{len(indices)}', flush=True)

    kids = ' '.join(f'{r} 0 R' for r in refs_pages)
    pdf.ecrire(num_pages,
               f'<< /Type /Pages /Count {len(refs_pages)} /Kids [{kids}] >>'.encode())

    num_infos = pdf.reserver()
    pdf.ecrire(num_infos, (
        b'<< /Title (Korean Stories - Livret A1) /Author (Korean Stories) '
        b'/Subject (Methode de coreen niveau A1 - 280 pages) '
        b'/Creator (Korean Stories) /Producer (Korean Stories) >>'))
    pdf.ecrire(num_catalogue,
               f'<< /Type /Catalog /Pages {num_pages} 0 R >>'.encode())

    chemin = sortie or f'/tmp/_hyb_{dpi}.pdf'
    with open(chemin, 'wb') as f:
        f.write(pdf.finaliser(num_catalogue, num_infos))
    src.close()
    return chemin, os.path.getsize(chemin), stats


if __name__ == '__main__':
    dpi = int(sys.argv[1])
    total = fitz.open(SRC).page_count
    if len(sys.argv) > 2 and sys.argv[2] == 'complet':
        chemin, taille, st = construire(
            dpi, sortie=f'livret-a1-{dpi}dpi.pdf', bavard=True)
        print(f'\n{chemin} : {taille / 1024 / 1024:.2f} Mo')
        print(f'  {st["indexed"]} pages en palette, {st["jpeg"]} en JPEG')
    else:
        ech = list(range(0, total, 10))
        chemin, taille, st = construire(dpi, pages=ech)
        print(f'{dpi} dpi : ~{taille / len(ech) * total / 1024 / 1024:.1f} Mo '
              f'estimes ({st["indexed"]} palette / {st["jpeg"]} JPEG '
              f'sur {len(ech)} pages)')
