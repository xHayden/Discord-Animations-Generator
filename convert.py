import imgkit

def create_snapshots():
    for i in range(10):
        options = {
            'format': 'png',
            'javascript-delay': str((i * 10)),
            'allow': ".",
            'crop-h': '1000',
            'crop-w': '1000',
            'crop-x': '5000',
            'crop-y': '5000',
            'debug-javascript': None,
            'cookie': [
                ('target', '22'),   
            ],
            'enable-local-file-access': None
        }
        imgkit.from_file('roulette.html', 'out{0}.png'.format(i), options=options)
create_snapshots()
#imgkit.from_url('https://codedecatur.org', 'out.jpg')

#imgkit.from_string('Hello!', 'out.jpg')
