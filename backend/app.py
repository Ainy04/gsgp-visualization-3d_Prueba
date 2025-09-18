from flask import Flask, render_template
import os

# Definir rutas absolutas
template_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static', 'templates')
static_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
