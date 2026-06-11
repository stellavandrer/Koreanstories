import http.server, os
os.chdir('/Users/justinetilleul/Desktop/DesignbyStelva/Site Web/Site')
httpd = http.server.HTTPServer(('', 8766), http.server.SimpleHTTPRequestHandler)
httpd.serve_forever()
