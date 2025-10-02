import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap
from io import StringIO

class DataProcessor:
    def __init__(self):
        self.data = None
        self.reduced_data = None
        self.original_columns = None
        
    def load_csv_data(self, csv_content):
        try:
            df = pd.read_csv(StringIO(csv_content))
            
            if df.shape[1] < 2:
                return {'success': False, 'error': 'CSV must have at least 2 columns'}
            
            self.data = df
            self.original_columns = df.columns.tolist()
            
            return {
                'success': True,
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': self.original_columns
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def apply_dimensionality_reduction(self, method='pca', n_components=3):
        if self.data is None:
            return {'success': False, 'error': 'No data loaded'}
        
        try:
            numeric_data = self.data.select_dtypes(include=[np.number])
            
            if numeric_data.shape[1] < 2:
                return {'success': False, 'error': 'Need at least 2 numeric columns'}
            
            # Limpiar NaN
            numeric_data_clean = numeric_data.fillna(numeric_data.mean())
            numeric_data_clean = numeric_data_clean.fillna(0)
            
            if numeric_data_clean.shape[0] < 2:
                return {'success': False, 'error': 'Not enough valid data rows'}
            
            if method == 'pca':
                reducer = PCA(n_components=min(n_components, numeric_data_clean.shape[1]))
            elif method == 'tsne':
                reducer = TSNE(n_components=min(n_components, 3), random_state=42)
            elif method == 'umap':
                reducer = umap.UMAP(n_components=min(n_components, 3), random_state=42)
            else:
                return {'success': False, 'error': f'Unknown method: {method}'}
            
            self.reduced_data = reducer.fit_transform(numeric_data_clean)
            
            return {
                'success': True,
                'method': method,
                'components': self.reduced_data.shape[1],
                'rows_processed': self.reduced_data.shape[0]
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_visualization_data(self):
        if self.reduced_data is None:
            return {'success': False, 'error': 'No reduced data available'}
        
        try:
            generation_col = None
            for col in self.data.columns:
                if 'gen' in col.lower():
                    generation_col = col
                    break
            
            result = {'success': True, 'generations': {}}
            
            if generation_col and generation_col in self.data.columns:
                for gen in self.data[generation_col].dropna().unique():
                    if pd.isna(gen):
                        continue
                    
                    mask = self.data[generation_col] == gen
                    gen_data = self.reduced_data[mask]
                    
                    points = []
                    for i in range(len(gen_data)):
                        point = {'x': float(gen_data[i, 0]), 'y': float(gen_data[i, 1])}
                        if gen_data.shape[1] > 2:
                            point['z'] = float(gen_data[i, 2])
                        points.append(point)
                    
                    try:
                        gen_label = f'Gen {int(gen)}'
                    except (ValueError, TypeError):
                        gen_label = f'Gen {gen}'
                    
                    result['generations'][gen_label] = points
            else:
                points = []
                for i in range(len(self.reduced_data)):
                    point = {
                        'x': float(self.reduced_data[i, 0]),
                        'y': float(self.reduced_data[i, 1])
                    }
                    if self.reduced_data.shape[1] > 2:
                        point['z'] = float(self.reduced_data[i, 2])
                    points.append(point)
                
                result['generations']['All Data'] = points
            
            return result
        except Exception as e:
            return {'success': False, 'error': str(e)}

processor = DataProcessor()