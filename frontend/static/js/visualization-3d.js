        // Clase Visualization3D corregida
        class Visualization3D {
        constructor() {
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.data3D = { generations: {}, target_point: null, evolution_trace: [] };
            this.generationGroups = {};
            this.currentGeneration = 0;
            this.maxGeneration = 0;
            this.isPlaying = false;
            this.playInterval = null;
            this.isVisible = false;

            // Variables compartidas con el sistema 2D
            this.parsedData = null;
            this.Values = null;
            this.generations = null;
            this.colors = null;
            this.defaultSizes = null;

            console.log('Visualization3D inicializado');
            
            // Verificar si los datos ya están disponibles
            this.checkFor2DData();
            
            // Suscribirse al evento de datos 2D listos
            window.addEventListener('2DDataReady', (event) => {
                console.log('Evento 2DDataReady recibido en 3D');
                
                // Usar datos del evento si están disponibles
                const eventData = event.detail;
                if (eventData && eventData.parsedData) {
                    this.syncWith2DSystem(eventData);
                } else {
                    // Fallback: buscar datos en window
                    this.syncWith2DSystem({
                        parsedData: window.parsedData,
                        Values: window.Values,
                        generations: window.generations,
                        colors: window.colors,
                        defaultSizes: window.defaultSizes || []
                    });
                }
            });
        }

        checkFor2DData() {
            // Verificar periódicamente si los datos 2D ya están disponibles
            const checkInterval = setInterval(() => {
                if (window.parsedData && window.generations) {
                    console.log('Datos 2D encontrados, sincronizando...');
                    this.syncWith2DSystem({
                        parsedData: window.parsedData,
                        Values: window.Values,
                        generations: window.generations,
                        colors: window.colors,
                        defaultSizes: window.defaultSizes || []
                    });
                    clearInterval(checkInterval);
                }
            }, 500);
                // Detener la verificación después de 10 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);
        }
        
            // Método para sincronizar datos con el sistema 2D
            syncWith2DSystem(data2D) {
                if (!data2D.parsedData || !data2D.generations) {
                    console.error('Datos 2D inválidos:', data2D);
                    this.showDataWarning();
                    return;
                }

                this.parsedData = data2D.parsedData;
                this.Values = data2D.Values;
                this.generations = data2D.generations;
                this.colors = data2D.colors;
                this.defaultSizes = data2D.defaultSizes;

                this.processDataFor3D();
                
                // Si la visualización está visible, actualizarla
                if (this.isVisible) {
                    this.setupVisualization();
                }
            }
            
            // Procesar datos CSV para generar coordenadas 3D
            processDataFor3D() {
                console.log('Iniciando procesamiento de datos para 3D...');
                console.log('parsedData disponible:', !!this.parsedData);
                console.log('generations disponible:', !!this.generations);
                
                if (!this.parsedData || !this.generations) {
                    console.warn('No hay datos para procesar en 3D');
                    console.log('parsedData:', this.parsedData);
                    console.log('generations:', this.generations);
                    this.showDataWarning();
                    return;
                }

                this.data3D = { generations: {}, target_point: null, evolution_trace: [] };

                // Buscar la generación máxima
                const validGenerations = this.generations.filter(g => {
                    const isValid = typeof g === 'number' && !isNaN(g) && isFinite(g);
                    if (!isValid) console.log('Generación inválida encontrada:', g);
                    return isValid;
                });
                
                this.maxGeneration = validGenerations.length > 0 ? Math.max(...validGenerations.filter(g => g >= 0)) : 0;
                console.log('Generación máxima encontrada:', this.maxGeneration);
                console.log('Número total de elementos a procesar:', this.parsedData.length);

                let processedCount = 0;
                let skippedCount = 0;

                this.parsedData.forEach((item, index) => {
                    if (!item || !Array.isArray(item) || item.length < 1) {
                        console.warn('Item inválido en índice:', index, item);
                        skippedCount++;
                        return;
                    }

                    const dataValues = item[0]; // [x, y]
                    const generation = this.generations[index];

                    // Verificar que dataValues es un array con al menos 2 elementos
                    if (!Array.isArray(dataValues) || dataValues.length < 2) {
                        console.warn('Fila sin coordenadas válidas:', index, dataValues);
                        skippedCount++;
                        return;
                    }

                    const x = parseFloat(dataValues[0]);
                    const y = parseFloat(dataValues[1]);
                    const z = typeof generation === 'number' && !isNaN(generation) ? generation : 0;

                    if (isNaN(x) || isNaN(y)) {
                        console.warn('Coordenadas inválidas en fila:', index, { x, y, z, generation });
                        skippedCount++;
                        return;
                    }

                    const point3D = {
                        x: x,
                        y: y,
                        z: z,
                        generation: generation,
                        index: index
                    };

                    const genKey = this.getGenerationKey(generation);
                    if (!this.data3D.generations[genKey]) {
                        this.data3D.generations[genKey] = [];
                    }
                    this.data3D.generations[genKey].push(point3D);

                    if (generation === -1) {
                        this.data3D.target_point = point3D;
                    }

                    processedCount++;
                });

                console.log(`Procesamiento completado: ${processedCount} puntos procesados, ${skippedCount} omitidos`);
                console.log('Grupos de generaciones creados:', Object.keys(this.data3D.generations));

                this.createEvolutionTrace();
                
                if (processedCount > 0) {
                    console.log('Datos 3D procesados correctamente');
                    this.hideDataWarning();
                } else {
                    console.error('No se pudieron procesar datos para 3D');
                    this.showDataWarning();
                }
                this.minX = Infinity;
                this.maxX = -Infinity;
                this.minY = Infinity;
                this.maxY = -Infinity;

                this.parsedData.forEach((item, index) => {
                    const dataValues = item[0];
                    const generation = this.generations[index];
                    if (!Array.isArray(dataValues) || dataValues.length < 2) return;

                    const x = parseFloat(dataValues[0]);
                    const y = parseFloat(dataValues[1]);

                    if (!isNaN(x) && !isNaN(y)) {
                        this.minX = Math.min(this.minX, x);
                        this.maxX = Math.max(this.maxX, x);
                        this.minY = Math.min(this.minY, y);
                        this.maxY = Math.max(this.maxY, y);
                    }

                    const rangeX = this.maxX - this.minX;
                    const rangeY = this.maxY - this.minY;
                    const maxRange = Math.max(rangeX, rangeY);

                    this.globalScale = this.maxGeneration > 0
                        ? this.maxGeneration / maxRange   // normaliza XY al rango de Z
                        : 1;

                });
            }

            
            
            getGenerationKey(generation) {
                if (generation === -1) return 'target';
                if (generation === -2) return 'initial_population';
                if (generation === -3) return 'random_trees';
                if (generation === -5) return 'best_individual';
                return `gen_${generation}`;
            }
            
            createEvolutionTrace() {
                // Crear traza de evolución basada en los mejores individuos
                this.data3D.evolution_trace = [];
                
                if (!this.data3D.generations) {
                    console.warn("No hay generaciones disponibles para crear traza de evolución.");
                    return;
                }
                
                // Obtener el mejor individuo de cada generación
                Object.keys(this.data3D.generations).forEach(key => {
                    if (key.startsWith('gen_')) {
                        const generationData = this.data3D.generations[key];
                        if (generationData && generationData.length > 0) {
                            // Simplemente tomar el primer punto por ahora
                            this.data3D.evolution_trace.push(generationData[0]);
                        }
                    }
                });
                
                // Ordenar por generación
                this.data3D.evolution_trace.sort((a, b) => a.generation - b.generation);
                console.log('Traza de evolución creada con', this.data3D.evolution_trace.length, 'puntos');
            }
            
            toggle3DPlot() {
                const container = document.getElementById('plot3d-container');
                const button = document.getElementById('show3DButton');
                const loadingMessage = document.querySelector('.loading-message');
                
                if (!container || !button) {
                    console.error('Elementos DOM no encontrados');
                    return;
                }
                
                if (!this.isVisible) {
                    console.log('Mostrando gráfica 3D...');
                    
                    // Mostrar contenedor
                    container.style.display = 'block';
                    this.isVisible = true;
                    
                    // Mostrar mensaje de carga
                    if (loadingMessage) {
                        loadingMessage.style.display = 'block';
                    }
                    
                    // Inicializar 3D si no existe
                    if (!this.renderer) {
                        console.log('Inicializando renderer 3D...');
                        this.init3D();
                    }
                    
                    // Ocultar mensaje de carga después de un breve retraso
                    setTimeout(() => {
                        if (loadingMessage) {
                            loadingMessage.style.display = 'none';
                        }
                        
                        // Verificar si hay datos disponibles
                        if (!this.data3D || Object.keys(this.data3D.generations).length === 0) {
                            console.warn('No hay datos 3D disponibles');
                            this.showDataWarning();
                            return;
                        }
                        
                        // Configurar visualización
                        this.setupVisualization();
                    }, 100);
                    
                    button.textContent = 'Ocultar Visualización 3D';
                    button.classList.add('selected-button');
                    
                } else {
                    console.log('Ocultando gráfica 3D...');
                    container.style.display = 'none';
                    this.isVisible = false;
                    button.textContent = 'Mostrar Visualización 3D';
                    button.classList.remove('selected-button');
                    
                    // Pausar animación si está activa
                    if (this.isPlaying) {
                        this.toggleAnimation();
                    }
                }
            }
            
            showDataWarning() {
                const warning = document.querySelector('.data-warning');
                if (warning) {
                    warning.style.display = 'block';
                }
            }
            
            hideDataWarning() {
                const warning = document.querySelector('.data-warning');
                if (warning) {
                    warning.style.display = 'none';
                }
            }
            
            init3D() {
                console.log('Inicializando 3D...');
                
                const canvas = document.getElementById('three-canvas');
                const container = document.getElementById('three-canvas-container');
                
                if (!canvas || !container) {
                    console.error('Canvas o contenedor no encontrado');
                    return;
                }
                
                // Obtener dimensiones del contenedor
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                // Scene setup
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x1a1a2e);
                
                // Camera setup
                this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
                this.camera.position.set(15, 15, 15);
                this.camera.lookAt(0, 0, 0);
                
                // Renderer setup - esta es la parte crítica
                this.renderer = new THREE.WebGLRenderer({ 
                    canvas: canvas, 
                    antialias: true,
                    alpha: true
                });
                this.renderer.setSize(width, height);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                
                console.log('Renderer configurado:', width, 'x', height);
                
                // Lighting
                const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
                this.scene.add(ambientLight);
                
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(10, 10, 5);
                this.scene.add(directionalLight);
                
                // Add coordinate axes and grid
                this.addAxes();
                this.addMouseControls();
                
                // Handle window resize
                window.addEventListener('resize', () => this.onWindowResize());
                
                // Iniciar loop de animación
                this.animate();
                
                console.log('Inicialización 3D completada');
            }
            
            addAxes() {
                const axisLength = 10;
                
                // Eje X (rojo)
                const xGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-axisLength, 0, 0),
                    new THREE.Vector3(axisLength, 0, 0)
                ]);
                const xLine = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
                this.scene.add(xLine);
                
                // Eje Y (verde)
                const yGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, -axisLength, 0),
                    new THREE.Vector3(0, axisLength, 0)
                ]);
                const yLine = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
                this.scene.add(yLine);
                
                // Eje Z (azul)
                const zGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, -axisLength),
                    new THREE.Vector3(0, 0, axisLength)
                ]);
                const zLine = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
                this.scene.add(zLine);
                
                // Grilla
                const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
                gridHelper.rotation.x = Math.PI / 2;
                this.scene.add(gridHelper);
                
                console.log('Ejes y grilla agregados');
            }
            
            addMouseControls() {
                let isMouseDown = false;
                let mouseX = 0;
                let mouseY = 0;
                const canvas = this.renderer.domElement;
                
                canvas.addEventListener('mousedown', (event) => {
                    isMouseDown = true;
                    mouseX = event.clientX;
                    mouseY = event.clientY;
                    canvas.style.cursor = 'grabbing';
                });
                
                canvas.addEventListener('mousemove', (event) => {
                    if (!isMouseDown) return;
                    
                    const deltaX = event.clientX - mouseX;
                    const deltaY = event.clientY - mouseY;
                    
                    this.camera.position.x -= deltaX * 0.01;
                    this.camera.position.y += deltaY * 0.01;
                    
                    this.camera.lookAt(0, 0, 0);
                    
                    mouseX = event.clientX;
                    mouseY = event.clientY;
                    
                    this.render();
                });
                
                canvas.addEventListener('mouseup', () => {
                    isMouseDown = false;
                    canvas.style.cursor = 'grab';
                });
                
                canvas.addEventListener('wheel', (event) => {
                    event.preventDefault();
                    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
                    this.camera.position.multiplyScalar(zoomFactor);
                    this.camera.position.clampLength(5, 50);
                    this.camera.lookAt(0, 0, 0);
                    this.render();
                });
                
                console.log('Controles de mouse configurados');
            }
            
            setupVisualization() {
                if (!this.data3D || Object.keys(this.data3D.generations).length === 0) {
                    console.warn('No hay datos 3D para visualizar');
                    this.showDataWarning();
                    return;
                }
                
                console.log('Configurando visualización 3D...');
                
                this.clearScene();
                this.createGenerationGroups();
                this.setupControls();
                
                // Mostrar punto objetivo si existe
                if (this.data3D.target_point) {
                    console.log('Agregando punto objetivo');
                    this.addPoint(this.data3D.target_point, 0x00ff00, 'target', 1.5);
                }
                
                // Mostrar elementos iniciales
                this.showInitialElements();
                this.render();
                
                console.log('Visualización 3D configurada');
            }
            
            clearScene() {
                // Eliminar solo los objetos de datos, mantener ejes y grid
                const objectsToRemove = [];
                
                this.scene.traverse((child) => {
                    if (child.userData && child.userData.type === 'dataPoint') {
                        objectsToRemove.push(child);
                    }
                });
                
                objectsToRemove.forEach(obj => {
                    this.scene.remove(obj);
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                });
            }
            
            createGenerationGroups() {
                console.log('Creando grupos de generaciones...');
                
                this.generationGroups = {};
                
                // Procesar generaciones normales
                Object.keys(this.data3D.generations).forEach(key => {
                    const generationData = this.data3D.generations[key];
                    console.log(`Procesando grupo ${key}:`, generationData.length, 'puntos');
                    
                    if (key.startsWith('gen_')) {
                        const genNumber = parseInt(key.replace('gen_', ''));
                        
                        const group = new THREE.Group();
                        group.userData = { type: 'generation', generation: genNumber };
                        group.visible = false; // Inicialmente oculto
                        
                        generationData.forEach(point => {
                            const colorIndex = point.index;
                            const color = this.colors && this.colors[colorIndex] 
                                ? this.parseColor(this.colors[colorIndex]) 
                                : 0x888888;
                            
                            const mesh = this.createPointMesh(point, color, 'generation');
                            group.add(mesh);
                        });
                        
                        this.generationGroups[genNumber] = group;
                        this.scene.add(group);
                    } else {
                        // Procesar elementos especiales
                        const group = new THREE.Group();
                        group.userData = { type: key };
                        group.visible = true; // Visible por defecto
                        
                        const colorMap = {
                            'initial_population': 0x000080,
                            'random_trees': 0x800080,
                            'best_individual': 0xff0000,
                            'target': 0x00ff00
                        };
                        
                        generationData.forEach(point => {
                            const mesh = this.createPointMesh(point, colorMap[key] || 0x888888, key);
                            group.add(mesh);
                        });
                        
                        this.generationGroups[key] = group;
                        this.scene.add(group);
                    }
                });
                
                console.log('Grupos de generaciones creados:', Object.keys(this.generationGroups));
            }

            drawEvolutionTrace() {
                if (!this.data3D.evolution_trace || this.data3D.evolution_trace.length === 0) {
                    console.warn("No hay traza de evolución para dibujar.");
                    return;
                }

                const offsetX = (this.minX + this.maxX) / 2;
                const offsetY = (this.minY + this.maxY) / 2;

                const points = this.data3D.evolution_trace.map(p =>
                    new THREE.Vector3(
                        (p.x - offsetX) * this.globalScale,
                        (p.y - offsetY) * this.globalScale,
                        p.z
                    )
                );

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
                const line = new THREE.Line(geometry, material);

                line.userData = { type: "evolutionTrace" };
                this.scene.add(line);
                this.render();
            }

            parseColor(colorString) {
                if (typeof colorString === 'number') return colorString;
                if (typeof colorString !== 'string') return 0x888888;
                
                // Convertir colores CSS a hexadecimal
                const colorMap = {
                    'red': 0xff0000, 'green': 0x00ff00, 'blue': 0x0000ff,
                    'navy': 0x000080, 'purple': 0x800080, 'lime': 0x00ff00
                };
                
                if (colorMap[colorString.toLowerCase()]) {
                    return colorMap[colorString.toLowerCase()];
                }
                
                // Intentar parsear como hex
                if (colorString.startsWith('#')) {
                    return parseInt(colorString.substring(1), 16);
                }
                
                return 0x888888; // Color por defecto
            }
            
            createPointMesh(point, color, type) {
                const geometry = new THREE.SphereGeometry(0.3);
                const material = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.8 });
                const mesh = new THREE.Mesh(geometry, material);

                // Ajustar la posición con una escala adecuada
                // Calcular offsets al centro
                const offsetX = (this.minX + this.maxX) / 2;
                const offsetY = (this.minY + this.maxY) / 2;

                // Normalizar (centrar en 0,0)
                mesh.position.set(
                    (point.x - offsetX) * this.globalScale,
                    (point.y - offsetY) * this.globalScale,
                    point.z
                );

                mesh.userData = { type: 'dataPoint', pointData: point, originalColor: color, pointType: type };
                return mesh;
            }
            
            addPoint(point, color, type, scale = 1) {
                const mesh = this.createPointMesh(point, color, type);
                mesh.scale.setScalar(scale);
                this.scene.add(mesh);
                return mesh;
            }
            
            setupControls() {
                const slider = document.getElementById('generation-3d-slider');
                const input = document.getElementById('generation-3d-input');
                
                if (slider && input && this.maxGeneration > 0) {
                    slider.max = this.maxGeneration;
                    slider.value = 0;
                    input.max = this.maxGeneration;
                    input.value = 0;
                    
                    console.log('Controles 3D configurados, max generation:', this.maxGeneration);
                }
            }
            
            showInitialElements() {
                console.log('Mostrando elementos iniciales...');
                
                // Mostrar elementos especiales por defecto
                ['initial_population', 'random_trees', 'best_individual', 'target'].forEach(key => {
                    if (this.generationGroups[key]) {
                        this.generationGroups[key].visible = true;
                        console.log(`Mostrando grupo: ${key}`);
                    }
                });
                
                // Mostrar primera generación
                if (this.generationGroups[0]) {
                    this.generationGroups[0].visible = true;
                    console.log('Mostrando generación 0');
                }
            }
            
            setGeneration(generation) {
                generation = Math.max(0, Math.min(generation, this.maxGeneration));
                this.currentGeneration = generation;
                
                console.log('Estableciendo generación:', generation);
                
                const slider = document.getElementById('generation-3d-slider');
                const input = document.getElementById('generation-3d-input');
                
                if (slider) slider.value = generation;
                if (input) input.value = generation;
                
                // Actualizar visibilidad de generaciones
                this.updateGenerationVisibility(generation);
                
                this.render();
            }
            
            updateGenerationVisibility(generation) {
                console.log('Actualizando visibilidad hasta generación:', generation);
                
                // Mantener elementos especiales siempre visibles
                ['initial_population', 'random_trees', 'best_individual', 'target'].forEach(key => {
                    if (this.generationGroups[key]) {
                        this.generationGroups[key].visible = true;
                    }
                });
                
                // Controlar visibilidad de generaciones normales
                Object.keys(this.generationGroups).forEach(key => {
                    const genNum = parseInt(key);
                    if (!isNaN(genNum)) {
                        const shouldBeVisible = genNum <= generation;
                        if (this.generationGroups[genNum]) {
                            this.generationGroups[genNum].visible = shouldBeVisible;
                        }
                    }
                });
            }
            
            showAllGenerations() {
                console.log('Mostrando todas las generaciones...');
                
                Object.values(this.generationGroups).forEach((group, index) => {
                    group.visible = true;
                });
                
                const slider = document.getElementById('generation-3d-slider');
                const input = document.getElementById('generation-3d-input');
                
                if (slider) slider.value = this.maxGeneration;
                if (input) input.value = this.maxGeneration;
                
                this.currentGeneration = this.maxGeneration;
                this.render();
            }
            
            toggleAnimation() {
                const btn = document.getElementById('play-3d-btn');
                
                if (this.isPlaying) {
                    clearInterval(this.playInterval);
                    this.isPlaying = false;
                    if (btn) btn.textContent = 'Reproducir';
                    console.log('Animación pausada');
                } else {
                    this.isPlaying = true;
                    if (btn) btn.textContent = 'Pausar';
                    console.log('Animación iniciada');
                    
                    this.playInterval = setInterval(() => {
                        if (this.currentGeneration >= this.maxGeneration) {
                            this.toggleAnimation();
                            return;
                        }
                        
                        this.setGeneration(this.currentGeneration + 1);
                    }, 500); // Más lento para mejor visualización
                }
            }
            
            onWindowResize() {
                if (!this.renderer || !this.isVisible) return;
                
                const container = document.getElementById('three-canvas-container');
                const containerRect = container.getBoundingClientRect();
                
                this.camera.aspect = containerRect.width / containerRect.height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(containerRect.width, containerRect.height);
                this.render();
            }
            
            render() {
                if (this.renderer && this.scene && this.camera && this.isVisible) {
                    this.renderer.render(this.scene, this.camera);
                }
            }
            
            animate() {
                requestAnimationFrame(() => this.animate());
                if (this.isVisible) {
                    this.render();
                }
            }
            
            // Funciones para integración con eventos
            bindEvents() {
                // Evento principal para mostrar/ocultar la gráfica 3D
                const show3DButton = document.getElementById('show3DButton');
                if (show3DButton) {
                    show3DButton.addEventListener('click', () => {
                        console.log('Toggle 3D button clicked');
                        this.toggle3DPlot();
                    });
                }
                
                // Eventos de controles 3D
                const showAllBtn = document.getElementById('show-all-3d-btn');
                const playBtn = document.getElementById('play-3d-btn');
                const evolutionBtn = document.getElementById('evolution-3d-btn');
                const slider = document.getElementById('generation-3d-slider');
                const input = document.getElementById('generation-3d-input');
                
                if (showAllBtn) {
                    showAllBtn.addEventListener('click', () => {
                        console.log('Show all 3D clicked');
                        this.showAllGenerations();
                    });
                }
                
                if (playBtn) {
                    playBtn.addEventListener('click', () => {
                        console.log('Play 3D clicked');
                        this.toggleAnimation();
                    });
                }
                
                if (evolutionBtn) {
                    evolutionBtn.addEventListener('click', () => {
                        console.log('Evolution 3D clicked');
                        this.toggleEvolutionTrace();
                    });
                }
                
                if (slider) {
                    slider.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value);
                        console.log('3D slider changed:', value);
                        this.setGeneration(value);
                    });
                }
                
                if (input) {
                    input.addEventListener('change', (e) => {
                        const value = parseInt(e.target.value);
                        console.log('3D input changed:', value);
                        this.setGeneration(value);
                    });
                }
                
                console.log('Eventos 3D configurados');
            }
            
            toggleEvolutionTrace() {
                const btn = document.getElementById('evolution-3d-btn');
                const existing = this.scene.getObjectByName('evolution-trace');
                
                if (existing) {
                    this.scene.remove(existing);
                    if (btn) btn.textContent = 'Evolución Óptima';
                    console.log('Traza de evolución removida');
                } else {
                    this.drawEvolutionTrace();
                    if (btn) btn.textContent = 'Ocultar Evolución';
                    console.log('Traza de evolución agregada');
                }
                
                this.render();
            }
            
        createEvolutionTrace() {
            // Crear traza de evolución basada en el mejor fitness por generación
            this.data3D.evolution_trace = [];
            
            if (!this.data3D.generations) {
                console.warn("No hay generaciones disponibles para crear traza de evolución.");
                return;
            }

            Object.keys(this.data3D.generations).forEach(key => {
                if (key.startsWith('gen_')) {
                    const generationData = this.data3D.generations[key];
                    if (generationData && generationData.length > 0) {
                        let best = generationData[0];
                        let bestFitness = this.Values ? this.Values[best.index] : Infinity;

                        generationData.forEach(p => {
                            const f = this.Values ? this.Values[p.index] : Infinity;
                            if (f < bestFitness) {  // menor fitness = mejor
                                best = p;
                                bestFitness = f;
                            }
                        });

                        this.data3D.evolution_trace.push(best);
                    }
                }
            });

            // Ordenar por número de generación
            this.data3D.evolution_trace.sort((a, b) => a.generation - b.generation);
            console.log('Traza de evolución creada con', this.data3D.evolution_trace.length, 'puntos');
        }

        }

        // Instancia global del visualizador 3D
        let visualization3D = null;

        // Inicialización cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Inicializando sistema 3D...');
            
            // Inicializar el visualizador 3D
            visualization3D = new Visualization3D();
            
            // Configurar eventos
            visualization3D.bindEvents();
            
            console.log('Sistema de visualización 3D inicializado y eventos configurados');
            
            // Verificar si ya hay datos 2D disponibles (si se cargaron antes de que el 3D se inicializara)
            if (window.parsedData && window.generations) {
                console.log('Datos 2D ya disponibles, sincronizando...');
                visualization3D.syncWith2DSystem({
                    parsedData: window.parsedData,
                    Values: window.Values,
                    generations: window.generations,
                    colors: window.colors,
                    defaultSizes: window.defaultSizes || []
                });
            }
        });
// Agregar función de debug para verificar datos
function debugDataAvailability() {
    console.log("=== DEBUG: Verificación de datos ===");
    console.log("window.parsedData:", window.parsedData ? `${window.parsedData.length} elementos` : 'undefined');
    console.log("window.generations:", window.generations ? `${window.generations.length} elementos` : 'undefined');
    console.log("window.colors:", window.colors ? `${window.colors.length} elementos` : 'undefined');
    
    if (window.parsedData && window.parsedData.length > 0) {
        console.log("Primer elemento de parsedData:", window.parsedData[0]);
    }
    if (window.generations && window.generations.length > 0) {
        console.log("Primeras 5 generaciones:", window.generations.slice(0, 5));
    }
}

// Llamar esta función desde la consola del navegador para debug
window.debugDataAvailability = debugDataAvailability;
window.visualization3D = visualization3D;