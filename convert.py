import imgkit



path_wkthmltoimage = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltoimage.exe'
config = imgkit.config(wkhtmltoimage=path_wkthmltoimage)

imgkit.from_url('https://codedecatur.org', 'out.jpg', config=config)
#imgkit.from_file('test.html', 'out.jpg')
#imgkit.from_string('Hello!', 'out.jpg')