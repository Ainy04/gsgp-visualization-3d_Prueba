from processor import processor
from flask import Flask, jsonify, render_template, request
import os

# Definir rutas absolutas
template_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static', 'templates')
static_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/visualization')
def visualization():
    return render_template('visualization.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        if not file.filename.endswith('.csv'):
            return jsonify({'success': False, 'error': 'Please upload a CSV file'})
        
        # Read file content
        file_content = file.read().decode('utf-8')
        
        # Load and validate data
        result = processor.load_csv_data(file_content)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': f'Upload error: {str(e)}'})

@app.route('/process', methods=['POST'])
def process_data():
    try:
        data = request.get_json()
        method = data.get('method', 'tsne')
        
        if processor.data is None:
            return jsonify({'success': False, 'error': 'No data loaded'})
        
        # Apply dimensionality reduction
        result = processor.apply_dimensionality_reduction(method=method)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': f'Processing error: {str(e)}'})

@app.route('/visualize')
def get_visualization_data():
    try:
        result = processor.get_visualization_data()
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Visualization error: {str(e)}'})


if __name__ == '__main__':
    app.run(debug=True)