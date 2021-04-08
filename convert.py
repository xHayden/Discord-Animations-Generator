import imgkit

def create_snapshots():
    for i in range(1):
        options = {
            'format': 'png',
            'javascript-delay': str((i * 10) + 1000),
            'allow': "."
        }
        imgkit.from_file('roulette.html', 'out{0}.jpg'.format(i), options=options)
create_snapshots()
#imgkit.from_url('https://codedecatur.org', 'out.jpg')

#imgkit.from_string('Hello!', 'out.jpg')
