// Clase Visualization3D mejorada con sistema completo de colores
// Variables globales para evitar bucles infinitos de sincronización
let isSyncing2DTo3D = false;
let isSyncing3DTo2D = false;

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

        // Sistema de colores integrado desde 2D
        this.currentColorMap = 'spectrum';
        this.firstPositive = null;
        this.secondPositive = null;
        this.howManyGenerations = 0;

        console.log('Visualization3D inicializado');
        
        // Verificar si los datos ya están disponibles
        this.checkFor2DData();
        
        // Suscribirse al evento de datos 2D listos
        window.addEventListener('2DDataReady', (event) => {
            console.log('Evento 2DDataReady recibido en 3D');
            
            const eventData = event.detail;
            if (eventData && eventData.parsedData) {
                this.syncWith2DSystem(eventData);
            } else {
                this.syncWith2DSystem({
                    parsedData: window.parsedData,
                    Values: window.Values,
                    generations: window.generations,
                    colors: window.colors,
                    defaultSizes: window.defaultSizes || []
                });
            }
        });

        // Inicializar los event listeners para cambio de paletas de color
        this.setupColorPaletteListeners();
    }

    checkFor2DData() {
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
        
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 10000);
    }

    // Configurar listeners para los botones de paleta de colores
    setupColorPaletteListeners() {
        const paletteButtons = [
            { id: "btn-viridis", map: "viridis" },
            { id: "btn-magma", map: "magma" },
            { id: "btn-cividis", map: "cividis" },
            { id: "btn-blue-red", map: "blue-red" },
            { id: "btn-purple-pink", map: "purple-pink" },
            { id: "btn-spectrum", map: "spectrum" }
        ];

        paletteButtons.forEach(({ id, map }) => {
            const button = document.getElementById(id);
            if (button) {
                // Remover listeners existentes para evitar duplicados
                button.removeEventListener('click', this.handleColorMapChange);
                
                // Agregar nuevo listener
                button.addEventListener('click', () => {
                    this.updateColorMap3D(map);
                });
            }
        });

        console.log('Listeners de paleta de colores configurados para 3D');
    }

    // Método para cambiar la paleta de colores en 3D
    updateColorMap3D(mapName) {
        console.log('Cambiando paleta de colores 3D a:', mapName);
        
        this.currentColorMap = mapName;
        
        // Regenerar colores con la nueva paleta
        if (this.generations && this.generations.length > 0) {
            this.colors = this.generateColors3D(this.generations);
            
            // Actualizar los colores en la escena 3D
            this.updateSceneColors();
            
            // Renderizar los cambios
            this.render();
        }
    }

    // Generar colores usando el mismo sistema que el 2D
    generateColors3D(generations) {
        console.log('Generando colores 3D con paleta:', this.currentColorMap);
        
        const colorMaps = {
            viridis: ["#440154", "#482878", "#3E4A89", "#31688E", "#26828E", "#1F9E89", "#35B779", "#6DCD59", "#B4DE2C", "#FDE725"],
            plasma: ["#0D0887", "#4B03A1", "#7D03A8", "#A522A7", "#CB4679", "#E06451", "#F1843D", "#FCA636", "#F6D746", "#F0F921"],
            magma: ["#000004", "#1B0C41", "#4A0C6B", "#781C6D", "#A52C60", "#CF4446", "#ED6925", "#FB9902", "#F9D225", "#FCFFA4"],
            cividis: ["#00224E", "#173B6E", "#32528E", "#4F699D", "#6C809E", "#89979D", "#A5AE9A", "#C0C692", "#DAD987", "#FDEE80"],
            "blue-red": [
                "#0033CC", "#0066FF", "#3399FF", "#66B2FF", "#99CCFF", 
                "#FFB85C", "#FF9F28", "#FF7518", "#FF4D00", "#FF1A1A", "#D60000"
            ],
            "purple-pink": [
                "#E0BBFF", "#D49EFF", "#C183F0", "#A367D6", "#9A4FBF", 
                "#D78CBB", "#E09FB9", "#F2A8D7", "#F6A3D0", "#FF8ACB", "#FF1F9E"
            ]
        };

        let colorArray = colorMaps[this.currentColorMap];
        let colors = [];
        
        if (generations.length === 0) return colors;

        let maxGeneration = this.howManyGenerations;
        let totalBlocks = Math.max(1, Math.floor(maxGeneration / (this.secondPositive - this.firstPositive)));
        let color;
        
        let hueStart = 55;  // Amarillo claro
        let hueEnd = 270;   // Azul-Morado
        let hueRange = hueEnd - hueStart;

        if (this.currentColorMap === 'spectrum') {
            generations.forEach((generation) => {
                // Asignar colores específicos para generaciones clave
                if (generation === -1) {
                    color = "green";
                } else if (generation === -2) {
                    color = "navy";
                } else if (generation === -3) {
                    color = "purple";
                } else if (generation === -5 || generation === -210) {
                    color = "red";
                } else {
                    let blockIndex = Math.floor(generation / (this.secondPositive - this.firstPositive));
                    let progress = blockIndex / totalBlocks;
                    let Bloques = this.secondPositive - this.firstPositive;

                    let hue = hueStart + progress * hueRange;
                    hue = hue % 360;

                    let positionInBlock = (generation % Bloques) / Bloques;
                    let minLightness = 50;
                    let maxLightness = 80;
                    let lightness = minLightness + positionInBlock * (maxLightness - minLightness);

                    color = `hsl(${hue}, 100%, ${lightness}%)`;
                }
                colors.push(color);
            });
        } else {
            generations.forEach((generation) => {
                if (generation === -1) {
                    color = "green";
                } else if (generation === -2) {
                    color = "navy";
                } else if (generation === -3) {
                    color = "purple";
                } else if (generation === -5 || generation === -210) {
                    color = "red";
                    if (this.currentColorMap === "purple-pink" || this.currentColorMap === "magma") {
                        color = "blue";
                    } else if (this.currentColorMap === "blue-red") {
                        color = "lime";
                    }
                } else {
                    let blockIndex = Math.floor(generation / (this.secondPositive - this.firstPositive));
                    let colorIndex = Math.round((blockIndex / totalBlocks) * (colorArray.length - 1));
                    color = colorArray[colorIndex];
                }
                colors.push(color);
            });
        }
        
        return colors;
    }

    // Actualizar colores en la escena 3D existente
    updateSceneColors() {
        if (!this.generationGroups || Object.keys(this.generationGroups).length === 0) {
            console.warn('No hay grupos de generaciones para actualizar colores');
            return;
        }

        console.log('Actualizando colores en escena 3D...');

        Object.keys(this.generationGroups).forEach(key => {
            const group = this.generationGroups[key];
            if (!group) return;

            group.traverse(obj => {
                if (obj.isMesh && obj.userData && obj.userData.pointData) {
                    const pointData = obj.userData.pointData;
                    const idx = pointData.index;
                    
                    if (idx !== undefined && this.colors && this.colors[idx]) {
                        const newColor = this.parseColor(this.colors[idx]);
                        obj.material.color.setHex(newColor);
                        obj.userData.originalColor = newColor;
                    }
                }
            });
        });

        console.log('Colores actualizados en escena 3D');
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

        // Calcular valores para el sistema de colores
        this.calculateColorSystemValues();

        // Procesar datos para 3D
        this.processDataFor3D();
        
        // Si la visualización está visible, actualizarla
        if (this.isVisible) {
            this.setupVisualization();
        }
    }

    // Calcular valores necesarios para el sistema de colores
    calculateColorSystemValues() {
        if (!this.generations || this.generations.length === 0) return;

        // Filtrar solo valores válidos
        let validGenerations = this.generations.filter(g => typeof g === 'number' && !isNaN(g));
        this.howManyGenerations = Math.max(...validGenerations);

        // Encontrar primer y segundo valor positivo
        for (let i = 0; i < this.generations.length; i++) {
            if (this.generations[i] > 0) {
                if (this.firstPositive === null) {
                    this.firstPositive = this.generations[i];
                } else if (this.generations[i] !== this.firstPositive) {
                    this.secondPositive = this.generations[i];
                    break;
                }
            }
        }

        console.log('Valores del sistema de colores calculados:', {
            howManyGenerations: this.howManyGenerations,
            firstPositive: this.firstPositive,
            secondPositive: this.secondPositive
        });
    }
        
    // Procesar datos CSV para generar coordenadas 3D
    processDataFor3D() {
        console.log('Iniciando procesamiento de datos para 3D...');
        
        if (!this.parsedData || !this.generations) {
            console.warn('No hay datos para procesar en 3D');
            this.showDataWarning();
            return;
        }

        this.data3D = { generations: {}, target_point: null, evolution_trace: [] };

        // Encontrar valores mínimos y máximos para normalización
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        // Primera pasada: calcular rangos
        this.parsedData.forEach((item, index) => {
            if (!item || !Array.isArray(item) || item.length < 1) return;
            
            const dataValues = item[0];
            const generation = this.generations[index];
            
            if (!Array.isArray(dataValues) || dataValues.length < 2) return;

            const x = parseFloat(dataValues[0]);
            const y = parseFloat(dataValues[1]);
            const z = typeof generation === 'number' && !isNaN(generation) ? generation : 0;

            if (isNaN(x) || isNaN(y)) return;

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
        });

        // Calcular factores de escala para normalizar a un cubo [-10, 10]
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        const rangeZ = maxZ - minZ;
        
        const maxRange = Math.max(rangeX, rangeY, rangeZ);
        this.scaleFactor = maxRange > 0 ? 20 / maxRange : 1;
        
        this.offsetX = (minX + maxX) / 2;
        this.offsetY = (minY + maxY) / 2;
        this.offsetZ = (minZ + maxZ) / 2;

        console.log('Factores de escala:', {
            minX, maxX, minY, maxY, minZ, maxZ,
            rangeX, rangeY, rangeZ,
            scaleFactor: this.scaleFactor,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            offsetZ: this.offsetZ
        });

        // Segunda pasada: procesar datos con normalización
        let processedCount = 0;
        
        this.parsedData.forEach((item, index) => {
            if (!item || !Array.isArray(item) || item.length < 1) return;
            
            const dataValues = item[0];
            const generation = this.generations[index];
            
            if (!Array.isArray(dataValues) || dataValues.length < 2) return;

            const x = parseFloat(dataValues[0]);
            const y = parseFloat(dataValues[1]);
            const z = typeof generation === 'number' && !isNaN(generation) ? generation : 0;

            if (isNaN(x) || isNaN(y)) return;

            // Aplicar normalización
            const normalizedX = (x - this.offsetX) * this.scaleFactor;
            const normalizedY = (y - this.offsetY) * this.scaleFactor;
            const normalizedZ = (z - this.offsetZ) * this.scaleFactor;

            const point3D = {
                x: normalizedX,
                y: normalizedY,
                z: normalizedZ,
                originalX: x,
                originalY: y,
                originalZ: z,
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

        const totalPoints = processedCount;
        this.sizeFactor = Math.max(0.1, 1 - Math.log10(totalPoints) / 10);
        console.log('Factor de tamaño calculado:', this.sizeFactor, 'para', totalPoints, 'puntos');
        
        // Calcular la máxima generación
        this.maxGeneration = 0;
        Object.keys(this.data3D.generations).forEach(key => {
            if (key.startsWith('gen_')) {
                const genNum = parseInt(key.replace('gen_', ''));
                if (genNum > this.maxGeneration) {
                    this.maxGeneration = genNum;
                }
            }
        });
        console.log('Máxima generación:', this.maxGeneration);
        
        // Calcular la traza de evolución
        this.calculateEvolutionTrace();

        // Regenerar colores con el sistema actualizado
        if (this.generations && this.generations.length > 0) {
            this.colors = this.generateColors3D(this.generations);
        }
    }
        
    // Calcular la traza de evolución (mejor individuo por generación)
    calculateEvolutionTrace() {
        this.data3D.evolution_trace = [];
        
        if (!this.data3D.target_point) {
            console.log("No hay punto objetivo, no se puede calcular la traza de evolución");
            return;
        }
        
        const target = this.data3D.target_point;
        
        for (let gen = 0; gen <= this.maxGeneration; gen++) {
            const genKey = `gen_${gen}`;
            if (!this.data3D.generations[genKey] || this.data3D.generations[genKey].length === 0) {
                continue;
            }
            
            let bestPoint = null;
            let minDistance = Infinity;
            
            this.data3D.generations[genKey].forEach(point => {
                const dx = point.x - target.x;
                const dy = point.y - target.y;
                const dz = point.z - target.z;
                const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestPoint = point;
                }
            });
            
            if (bestPoint) {
                this.data3D.evolution_trace.push(bestPoint);
            }
        }
        
        console.log(`Traza de evolución calculada con ${this.data3D.evolution_trace.length} puntos`);
    }
        
    getGenerationKey(generation) {
        if (generation === -1) return 'target';
        if (generation === -2) return 'initial_population';
        if (generation === -3) return 'random_trees';
        if (generation === -5) return 'best_individual';
        return `gen_${generation}`;
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
            
            container.style.display = 'block';
            this.isVisible = true;
            
            if (loadingMessage) {
                loadingMessage.style.display = 'block';
            }
            
            if (!this.renderer) {
                console.log('Inicializando renderer 3D...');
                this.init3D();
            }
            
            setTimeout(() => {
                if (loadingMessage) {
                    loadingMessage.style.display = 'none';
                }
                
                if (!this.data3D || Object.keys(this.data3D.generations).length === 0) {
                    console.warn('No hay datos 3D disponibles');
                    this.showDataWarning();
                    return;
                }
                
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
        console.log('Inicializando 3D con espacio normalizado...');
        
        const canvas = document.getElementById('three-canvas');
        const container = document.getElementById('three-canvas-container');
        
        if (!canvas || !container) {
            console.error('Canvas o contenedor no encontrado');
            return;
        }
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        this.addAxes();
        this.addMouseControls();
        this.addBoundingBox();
        
        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
        
        console.log('Inicialización 3D completada con espacio normalizado');
    }

    addBoundingBox() {
        const boxGeometry = new THREE.BoxGeometry(20, 20, 20);
        const boxEdges = new THREE.EdgesGeometry(boxGeometry);
        const boxLine = new THREE.LineSegments(
            boxEdges,
            new THREE.LineBasicMaterial({ 
                color: 0x444444, 
                transparent: true, 
                opacity: 0.2,
                linewidth: 1
            })
        );
        this.scene.add(boxLine);
    }
        
    addAxes() {
        const axisLength = 10;
        
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-axisLength, 0, 0),
            new THREE.Vector3(axisLength, 0, 0)
        ]);
        const xLine = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        this.scene.add(xLine);
        
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -axisLength, 0),
            new THREE.Vector3(0, axisLength, 0)
        ]);
        const yLine = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        this.scene.add(yLine);
        
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -axisLength),
            new THREE.Vector3(0, 0, axisLength)
        ]);
        const zLine = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
        this.scene.add(zLine);
        
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
        
        if (this.data3D.target_point) {
            console.log('Agregando punto objetivo');
            this.addPoint(this.data3D.target_point, 0x00ff00, 'target', 1.5);
        }
        
        this.showInitialElements();
        this.render();
        
        console.log('Visualización 3D configurada');
    }
        
    clearScene() {
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
        
        if (this.sizeFactor < 0.4) {
            console.log('Usando método de instancias para mejor rendimiento');
            this.createPointInstances();
            return;
        }
        
        Object.keys(this.data3D.generations).forEach(key => {
            const generationData = this.data3D.generations[key];
            const group = new THREE.Group();
            
            generationData.forEach(point => {
                let color;
                if (key === 'target') {
                    color = 0x00ff00;
                } else if (key === 'initial_population') {
                    color = 0x000080;
                } else if (key === 'random_trees') {
                    color = 0x800080;
                } else if (key === 'best_individual') {
                    color = 0xff0000;
                } else {
                    const index = point.index;
                    color = this.parseColor(this.colors[index]);
                }
                
                const mesh = this.createPointMesh(point, color, key);
                group.add(mesh);
            });
            
            this.scene.add(group);
            this.generationGroups[key] = group;
        });
    }

    drawEvolutionTrace() {
        if (!this.data3D.evolution_trace || this.data3D.evolution_trace.length === 0) {
            console.warn("No hay traza de evolución para dibujar.");
            return;
        }

        const points = this.data3D.evolution_trace.map(p =>
            new THREE.Vector3(p.x, p.y, p.z)
        );

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffff00, 
            linewidth: 2 
        });
        const line = new THREE.Line(geometry, material);

        this.scene.traverse(child => {
            if (child.userData && child.userData.type === "evolutionTrace") {
                this.scene.remove(child);
            }
        });

        line.userData = { type: "evolutionTrace" };
        line.name = 'evolution-trace';
        this.scene.add(line);
        this.render();
    }

    parseColor(colorString) {
        if (typeof colorString === 'number') return colorString;
        if (typeof colorString !== 'string') return 0x888888;

        // CSS rgb() → hex
        if (colorString.startsWith("rgb")) {
            const nums = colorString.match(/\d+/g).map(Number);
            return (nums[0] << 16) + (nums[1] << 8) + nums[2];
        }

        // CSS hsl() → hex
        if (colorString.startsWith("hsl")) {
            const hslMatch = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (hslMatch) {
                const h = parseInt(hslMatch[1]) / 360;
                const s = parseInt(hslMatch[2]) / 100;
                const l = parseInt(hslMatch[3]) / 100;
                
                const hslToRgb = (h, s, l) => {
                    let r, g, b;
                    if (s === 0) {
                        r = g = b = l; // achromatic
                    } else {
                        const hue2rgb = (p, q, t) => {
                            if (t < 0) t += 1;
                            if (t > 1) t -= 1;
                            if (t < 1/6) return p + (q - p) * 6 * t;
                            if (t < 1/2) return q;
                            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                            return p;
                        };
                        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        const p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1/3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1/3);
                    }
                    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
                };
                
                const [r, g, b] = hslToRgb(h, s, l);
                return (r << 16) + (g << 8) + b;
            }
        }

        if (colorString.startsWith("#")) {
            return parseInt(colorString.substring(1), 16);
        }

        const colorMap = {
            'red': 0xff0000, 'green': 0x00ff00, 'blue': 0x0000ff,
            'navy': 0x000080, 'purple': 0x800080, 'lime': 0x00ff00
        };
        return colorMap[colorString.toLowerCase()] || 0x888888;
    }
        
    createPointMesh(point, color, type) {
        let baseSize = 0.5 * this.sizeFactor;
        
        if (type === 'target') {
            baseSize *= 1.5;
        } else if (type === 'initial_population' || type === 'random_trees') {
            baseSize *= 1.2;
        }
        
        let geometry;
        
        if (type === 'random_trees') {
            geometry = new THREE.ConeGeometry(baseSize * 0.8, baseSize * 1.6, 3);
            geometry.rotateX(Math.PI);
        } else if (type === 'initial_population') {
            geometry = new THREE.ConeGeometry(baseSize * 0.8, baseSize * 1.6, 3);
        } else if (type === 'target') {
            const lineWidth = baseSize * 0.1;
            const crossShape = new THREE.Shape();
            crossShape.moveTo(-baseSize, -lineWidth);
            crossShape.lineTo(-lineWidth, -baseSize);
            crossShape.lineTo(lineWidth, -baseSize);
            crossShape.lineTo(baseSize, -lineWidth);
            crossShape.lineTo(baseSize, lineWidth);
            crossShape.lineTo(lineWidth, baseSize);
            crossShape.lineTo(-lineWidth, baseSize);
            crossShape.lineTo(-baseSize, lineWidth);
            crossShape.lineTo(-baseSize, -lineWidth);
            geometry = new THREE.ShapeGeometry(crossShape);
        } else {
            geometry = new THREE.SphereGeometry(baseSize * 0.8);
        }

        const material = new THREE.MeshLambertMaterial({ 
            color, 
            transparent: true, 
            opacity: this.sizeFactor > 0.3 ? 0.8 : 0.6
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(point.x, point.y, point.z);
        
        mesh.userData = { 
            type: 'dataPoint', 
            pointData: point, 
            originalColor: color, 
            pointType: type 
        };
        
        return mesh;
    }

    createPointInstances() {
        if (!this.data3D.generations) return;
        
        const sphereGeometry = new THREE.SphereGeometry(0.3 * this.sizeFactor);
        const coneGeometry = new THREE.ConeGeometry(0.4 * this.sizeFactor, 0.8 * this.sizeFactor, 3);
        coneGeometry.rotateX(Math.PI);
        
        Object.keys(this.data3D.generations).forEach(key => {
            const generationData = this.data3D.generations[key];
            const group = new THREE.Group();
            
            generationData.forEach(point => {
                let geometry, material;
                
                if (key === 'target') {
                    geometry = this.createTargetGeometry(0.5 * this.sizeFactor);
                    material = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.9 });
                } else if (key === 'initial_population') {
                    geometry = coneGeometry;
                    material = new THREE.MeshLambertMaterial({ color: 0x000080, transparent: true, opacity: 0.7 });
                } else if (key === 'random_trees') {
                    geometry = coneGeometry;
                    material = new THREE.MeshLambertMaterial({ color: 0x800080, transparent: true, opacity: 0.7 });
                } else if (key === 'best_individual') {
                    geometry = new THREE.SphereGeometry(0.5 * this.sizeFactor);
                    material = new THREE.MeshLambertMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 });
                } else {
                    geometry = sphereGeometry;
                    const color = this.parseColor(this.colors[point.index]);
                    material = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.6 });
                }
                
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(point.x, point.y, point.z);
                mesh.userData = { 
                    type: 'dataPoint', 
                    pointData: point, 
                    originalColor: this.parseColor(this.colors[point.index]), 
                    pointType: key 
                };
                group.add(mesh);
            });
            
            this.scene.add(group);
            this.generationGroups[key] = group;
        });
    }

    createTargetGeometry(size) {
        const shape = new THREE.Shape();
        shape.moveTo(-size, -size);
        shape.lineTo(size, size);
        shape.moveTo(-size, size);
        shape.lineTo(size, -size);
        return new THREE.ShapeGeometry(shape);
    }

    // Método mejorado para sincronizar colores desde 2D
    syncColors(newColors) {
        this.colors = newColors;
        console.log("Actualizando colores en 3D desde sincronización 2D...");

        // Actualizar colores en la escena
        this.updateSceneColors();
        this.render();
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
        
        ['initial_population', 'random_trees', 'best_individual', 'target'].forEach(key => {
            if (this.generationGroups[key]) {
                this.generationGroups[key].visible = true;
                console.log(`Mostrando grupo: ${key}`);
            }
        });
        
        if (this.generationGroups['gen_0']) {
            this.generationGroups['gen_0'].visible = true;
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
        
        this.updateGenerationVisibility(generation);
        this.render();

        Visualization3D.prototype.setGenerationWithSync = function(generation) {
        generation = Math.max(0, Math.min(generation, this.maxGeneration));
        this.currentGeneration = generation;
        
        console.log('Estableciendo generación 3D con sincronización:', generation);
        
        const slider = document.getElementById('generation-3d-slider');
        const input = document.getElementById('generation-3d-input');
        
        if (slider) slider.value = generation;
        if (input) input.value = generation;
        
        this.updateGenerationVisibility(generation);
        this.render();
        
        // Sincronizar con 2D
        if (!isSyncing2DTo3D) {
            sync2DWithSlider(generation);
        }
    };

    }
        
    updateGenerationVisibility(generation) {
        console.log('Actualizando visibilidad hasta generación:', generation);
        
        ['initial_population', 'random_trees', 'best_individual', 'target'].forEach(key => {
            if (this.generationGroups[key]) {
                this.generationGroups[key].visible = true;
            }
        });
        
        for (let i = 0; i <= generation; i++) {
            const genKey = `gen_${i}`;
            if (this.generationGroups[genKey]) {
                this.generationGroups[genKey].visible = true;
            }
        }
        
        for (let i = generation + 1; i <= this.maxGeneration; i++) {
            const genKey = `gen_${i}`;
            if (this.generationGroups[genKey]) {
                this.generationGroups[genKey].visible = false;
            }
        }
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
            }, 500);
        }

        Visualization3D.prototype.toggleAnimationWithSync = function() {
        const btn = document.getElementById('play-3d-btn');
        
        if (this.isPlaying) {
            clearInterval(this.playInterval);
            this.isPlaying = false;
            if (btn) btn.textContent = 'Reproducir';
            console.log('Animación 3D pausada');
            
            // Sincronizar pausa con 2D
            if (!isSyncing2DTo3D) {
                sync2DWithPlay(false);
            }
        } else {
            this.isPlaying = true;
            if (btn) btn.textContent = 'Pausar';
            console.log('Animación 3D iniciada');
            
            // Sincronizar reproducción con 2D
            if (!isSyncing2DTo3D) {
                sync2DWithPlay(true);
            }
            
            this.playInterval = setInterval(() => {
                if (this.currentGeneration >= this.maxGeneration) {
                    this.toggleAnimationWithSync();
                    return;
                }
                
                this.setGenerationWithSync(this.currentGeneration + 1);
            }, 500);
            }
        };
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
        const show3DButton = document.getElementById('show3DButton');
        if (show3DButton) {
            show3DButton.addEventListener('click', () => {
                console.log('Toggle 3D button clicked');
                this.toggle3DPlot();
            });
        }
        
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

    // Métodos de sincronización con sistema 2D
    syncWith2DSlider(generation) {
        console.log('Sincronizando 3D con slider 2D, generación:', generation);
        this.setGeneration(generation);
    }

    syncWith2DShowAll() {
        console.log('Sincronizando 3D con mostrar todo 2D');
        this.showAllGenerations();
    }

    syncWith2DTableSelection(selectedRows, removedRows, manualSelectedGenerations) {
        console.log('Sincronizando 3D con selección de tabla 2D');
        
        // Ocultar todas las generaciones normales primero
        for (let i = 0; i <= this.maxGeneration; i++) {
            const genKey = `gen_${i}`;
            if (this.generationGroups[genKey]) {
                this.generationGroups[genKey].visible = false;
            }
        }
        
        // Mostrar solo las generaciones seleccionadas
        selectedRows.forEach(rowIndex => {
            const generation = parseInt(rowIndex);
            if (generation >= 0) {
                const genKey = `gen_${generation}`;
                if (this.generationGroups[genKey]) {
                    this.generationGroups[genKey].visible = true;
                }
            }
        });
        
        // Mostrar generaciones agregadas manualmente
        manualSelectedGenerations.forEach(generation => {
            if (generation >= 0) {
                const genKey = `gen_${generation}`;
                if (this.generationGroups[genKey]) {
                    this.generationGroups[genKey].visible = true;
                }
            }
        });
        
        this.render();
    }
}

// Instancia global del visualizador 3D
let visualization3D = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema 3D...');
    
    visualization3D = new Visualization3D();
    visualization3D.bindEvents();
    
    console.log('Sistema de visualización 3D inicializado y eventos configurados');
    
    // Verificar si ya hay datos 2D disponibles
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

// Funciones de sincronización para ser llamadas desde el sistema 2D
window.sync3DWithSlider = function(generation) {
    if (window.visualization3D) {
        window.visualization3D.syncWith2DSlider(generation);
    }
};

window.sync3DWithShowAll = function() {
    if (window.visualization3D) {
        window.visualization3D.syncWith2DShowAll();
    }
};

window.sync3DWithColorChange = function(colors) {
    if (window.visualization3D) {
        window.visualization3D.syncColors(colors);
    }
};

window.sync3DWithTableSelection = function(selectedRows, removedRows, manualSelectedGenerations) {
    if (window.visualization3D) {
        window.visualization3D.syncWith2DTableSelection(selectedRows, removedRows, manualSelectedGenerations);
    }
};

window.integrate3DWithCSVLoad = function() {
    if (window.visualization3D && window.parsedData) {
        window.visualization3D.syncWith2DSystem({
            parsedData: window.parsedData,
            Values: window.Values,
            generations: window.generations,
            colors: window.colors,
            defaultSizes: window.defaultSizes || []
        });
    }
};

// Función de debug
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

// Función mejorada para sincronizar slider 3D → 2D
function sync2DWithSlider(generation) {
    if (isSyncing2DTo3D) return; // Evitar bucle infinito
    
    isSyncing3DTo2D = true;
    
    console.log('Sincronizando slider 3D → 2D, generación:', generation);
    
    // Actualizar controles 2D
    const slider2D = document.getElementById('slider');
        const input2D = document.getElementById('numeroPuntos');
    if (input2D) {
        input2D.addEventListener('input', function() {
            const valor = this.value;
            if (valor === '') return;
            
            const valorNumerico = parseInt(valor);
            if (!isNaN(valorNumerico) && valorNumerico >= window.firstPositive && valorNumerico <= window.howManyGenerations) {
                if (window.modo2) {
                    actualizarG2(valorNumerico);
                } else {
                    actualizarGrafica(valorNumerico);
                }
                
                // Sincronizar con 3D
                sync3DWithSlider(valorNumerico);
                
                window.ultimoValorValido = valorNumerico;
                
                const playButton = document.getElementById('playButton');
                if (playButton) {
                    playButton.textContent = 'Play';
                    window.animationPaused = true;
                    if (window.animationTimeout) {
                        clearTimeout(window.animationTimeout);
                    }
                }
            }
        });
    }
        const playButton2D = document.getElementById('playButton');
    if (playButton2D) {
        playButton2D.addEventListener('click', function() {
            const isPlaying = this.textContent === 'Pause';
            
            // Sincronizar con 3D
            setTimeout(() => {
                sync3DWithPlay(!isPlaying);
            }, 50);
        });
    }
    
    if (slider2D && input2D) {
        slider2D.value = generation;
        input2D.value = generation;
        
        // Actualizar visualización 2D
        if (window.modo2) {
            actualizarG2(generation);
        } else {
            actualizarGrafica(generation);
        }
        
        // Pausar animación 2D si está reproduciéndose
        if (playButton2D && playButton2D.textContent === 'Pause') {
            playButton2D.textContent = 'Play';
            window.animationPaused = true;
            if (window.animationTimeout) {
                clearTimeout(window.animationTimeout);
            }
        }
    }
    
    setTimeout(() => {
        isSyncing3DTo2D = false;
    }, 100);
}

// Función mejorada para sincronizar botón play 3D → 2D
function sync2DWithPlay(isPlaying3D) {
    if (isSyncing2DTo3D) return; // Evitar bucle infinito
    
    isSyncing3DTo2D = true;
    
    console.log('Sincronizando play 3D → 2D, estado:', isPlaying3D);
    
    const playButton2D = document.getElementById('playButton');
    
    if (playButton2D) {
        // Si 3D está reproduciendo y 2D no, iniciar 2D
        if (isPlaying3D && playButton2D.textContent === 'Play') {
            // Simular clic en el botón de play 2D
            playButton2D.click();
        }
        // Si 3D se pausa y 2D está reproduciendo, pausar 2D
        else if (!isPlaying3D && playButton2D.textContent === 'Pause') {
            playButton2D.textContent = 'Play';
            window.animationPaused = true;
            if (window.animationTimeout) {
                clearTimeout(window.animationTimeout);
            }
        }
    }
    
    setTimeout(() => {
        isSyncing3DTo2D = false;
    }, 100);
}

// Event listeners mejorados para el sistema 3D
function bindEnhanced3DEvents() {
    if (!window.visualization3D) return;
    
    const slider3D = document.getElementById('generation-3d-slider');
    const input3D = document.getElementById('generation-3d-input');
    const playBtn3D = document.getElementById('play-3d-btn');
    
    if (slider3D) {
        slider3D.removeEventListener('input', window.visualization3D.originalSliderHandler);
        slider3D.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            console.log('3D slider changed con sincronización:', value);
            window.visualization3D.setGenerationWithSync(value);
        });
    }
    
    if (input3D) {
        input3D.removeEventListener('change', window.visualization3D.originalInputHandler);
        input3D.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            console.log('3D input changed con sincronización:', value);
            window.visualization3D.setGenerationWithSync(value);
        });
    }
    
    if (playBtn3D) {
        playBtn3D.removeEventListener('click', window.visualization3D.originalPlayHandler);
        playBtn3D.addEventListener('click', () => {
            console.log('Play 3D clicked con sincronización');
            window.visualization3D.toggleAnimationWithSync();
        });
    }
}

function updateVisualization3DMethods() {
    if (!window.visualization3D) return;
    
    // Reemplazar métodos existentes con versiones sincronizadas
    window.visualization3D.setGeneration = window.visualization3D.setGenerationWithSync;
    window.visualization3D.toggleAnimation = window.visualization3D.toggleAnimationWithSync;
    
    console.log('Métodos de Visualization3D actualizados con sincronización');
}

// Función principal para inicializar toda la sincronización
function initializeSynchronization() {
    console.log('Inicializando sincronización completa entre 2D y 3D...');
    
    // Actualizar métodos de Visualization3D
    updateVisualization3DMethods();
    
    // Actualizar event listeners existentes del sistema 2D
    updateExisting2DEventListeners();
    
    // Configurar nuevos event listeners mejorados para 3D
    bindEnhanced3DEvents();
    
    console.log('Sincronización completa inicializada');
}

// Inicializar cuando ambos sistemas estén listos
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que ambos sistemas estén inicializados
    const checkBothSystemsReady = setInterval(() => {
        if (window.visualization3D && document.getElementById('slider') && document.getElementById('generation-3d-slider')) {
            initializeSynchronization();
            clearInterval(checkBothSystemsReady);
        }
    }, 500);
    
    // Timeout de seguridad
    setTimeout(() => {
        clearInterval(checkBothSystemsReady);
        if (window.visualization3D) {
            initializeSynchronization();
        }
    }, 10000);
});

// Exportar funciones para uso manual si es necesario
window.initializeSynchronization = initializeSynchronization;
window.sync3DWithSlider = sync3DWithSlider;
window.sync3DWithPlay = sync3DWithPlay;

window.debugDataAvailability = debugDataAvailability;
window.visualization3D = visualization3D;
