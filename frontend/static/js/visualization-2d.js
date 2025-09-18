document.addEventListener('DOMContentLoaded', function () {
    var parsedData;
    var Values;
    var generations;
	var howManyGenerations; // Variable que almacena cuantas generaciones hay
    var currentIndex = 0;
	let defaultSizes=[];
    var plotInitialized = false;
	var uploadFile=false;
    var colors = [];
	var removedHover=false;
	var modo2=false; //modo sin seleccion especifica
	var currentColorMap= 'spectrum';
	var plotInitializedC=false;
	var cambioEscala=false;
	var asignadoHover=false;
	const botonAbrir2 = document.getElementById('abrirPopup2');
    const botonCerrar2 = document.getElementById('cerrarPopup2');
    const popup2 = document.getElementById('popup2');
	
	const cerrarIns = document.getElementById('cerrarIns');
	// Selecciona el contenedor del contenido del popup
	const popupContenido = document.querySelector('.popup-contenido2');
	const menuButton = document.querySelector(".menu-button");
	const mainMenu = document.getElementById("mainMenu");
	const button1 = document.querySelector("#mainMenu .menu-item:nth-child(1)");
	const button2 = document.querySelector("#mainMenu .menu-item:nth-child(3)");
	const button3 = document.querySelector("#mainMenu .menu-item:nth-child(4)");
	const button4 = document.querySelector("#mainMenu .menu-item:nth-child(5)");
	const button5 = document.querySelector("#mainMenu .menu-item:nth-child(7)");
	const confirmButton = document.getElementById("confirmButton");
			
	const tooltip = document.getElementById('katexTooltip');
	const toggleAllBtn = document.getElementById("toggleAllBtn");
	var playButton = document.getElementById('playButton');   
	playButton.disabled=true;         
	var showAllButton = document.getElementById('showAllButton');
	showAllButton.disabled=true;
	var loadLastValuesButton=document.getElementById('loadLastValuesButton');
	loadLastValuesButton.disabled=true;
	const toggleButton = document.getElementById("toggleButton");
	const dropdownMenu = document.getElementById("dropdownMenu");
	const customizeFile= document.getElementById("customizeFile");
	
	const mostrarInstr= document.getElementById("mostrarInstr")
	mostrarInstr.addEventListener("click", () => {
		mostrarInstrucciones();
	});
	
	cerrarIns.addEventListener("click", () => {
		cerrarInstrucciones();
	})
	customizeFile.addEventListener("click", () => {
		openPopup();
	});
	
	toggleButton.addEventListener("click", () => {
	  dropdownMenu.style.display = dropdownMenu.style.display === "flex" ? "none" : "flex";
	});
			
	confirmButton.addEventListener("click", function () {
		closePopup();
	});
	
	toggleAllBtn.addEventListener("click", function () {
		toggleTodas();
	});
	
	let nameRows = [
        "IsBest",
        "Training",
        "Normalized Training",
        "Validation",
        "Normalized Validation",
        "Size",
        "Normalized Size",
        "Expression symbolic"
    ];

    function openPopup() {
      document.getElementById('popup').style.display = 'block';
      document.getElementById('overlay').style.display = 'block';
    }

    function closePopup() {
      document.getElementById('popup').style.display = 'none';
      document.getElementById('overlay').style.display = 'none';
    }
	
	 function cerrarInstrucciones() {
    document.getElementById('instrucciones').style.display = 'none';
    document.getElementById('bienvenida').style.display = 'block';
    }

    window.onload = function () {
        const tbody = document.getElementById('table-body');
        for (let i = 6; i <= 13; i++) {
            const tr = document.createElement('tr');

            const td1 = document.createElement('td');
            td1.textContent = nameRows[i - 6];
            td1.classList.add('mini-clickable', 'mini-inactive'); // <-- Marcado como inactivo desde el inicio
            td1.dataset.row = i;
            td1.addEventListener('click', toggleEstado);

            const td2 = document.createElement('td');
            td2.dataset.index = i;
            td2.id = `cell-${i}`;
            td2.textContent = 'X'; // <-- Mostrar 'X' desde el inicio
            td2.classList.add('mini-x-cell'); // <-- Aplicar estilo rojo

            tr.appendChild(td1);
            tr.appendChild(td2);
            tbody.appendChild(tr);
        }

    // Ya no es necesario reenumerar, porque todas están inactivas
    // reenumerar(); <-- Puedes comentar o quitar esta línea si no deseas numerarlas
    }


    function toggleEstado(event) {
        const td = event.target;
        const row = td.dataset.row;
        const td2 = document.getElementById(`cell-${row}`);
        const isActive = !td.classList.contains('mini-inactive');

        if (isActive) {
            td.classList.add('mini-inactive');
            td2.textContent = 'X';
            td2.classList.add('mini-x-cell');
        } else {
            td.classList.remove('mini-inactive');
            td2.classList.remove('mini-x-cell');
            td2.textContent = ''; // será actualizado por reenumerar()
        }

        reenumerar();
    }
	
	function mostrarInstrucciones() {
        document.getElementById('bienvenida').style.display = 'none';
        document.getElementById('instrucciones').style.display = 'block';
    }
	
    let colsActive=[0,0,0,0,0,0,0,0];
    function reenumerar() {
        let count = 6;
        for (let i = 6; i <= 13; i++) {
            const td = document.querySelector(`td[data-row="${i}"]`);
            const td2 = document.getElementById(`cell-${i}`);
            const isInactive = td.classList.contains('mini-inactive');
		
            if (!isInactive) {
                td2.textContent = count++;
                colsActive[i-6]=Number(td2.textContent);
                td2.classList.remove('mini-x-cell');
            }
            else {
		        colsActive[i-6]=0;
		    }
        }
	    console.log("Columnas:",colsActive);
	  
    }
	
    let toggleActivo = true; // Estado inicial: activar

    function toggleTodas() {
        for (let i = 6; i <= 13; i++) {
            const td = document.querySelector(`td[data-row="${i}"]`);
            const td2 = document.getElementById(`cell-${i}`);

            if (toggleActivo) {
                td.classList.remove('mini-inactive');
                td2.classList.remove('mini-x-cell');
                td2.textContent = ''; // será actualizado por reenumerar()
            } else {
                td.classList.add('mini-inactive');
                td2.textContent = 'X';
                td2.classList.add('mini-x-cell');
            }
        }
        toggleActivo = !toggleActivo; // Cambia el estado
        reenumerar();
    }

			
	const submenuEscala = document.getElementById("submenu-escala");
	submenuEscala.style.display = "none";
	
	// Deshabilitamos los botones al inicio
	button1.disabled = true;
	button2.disabled = true;
	button3.disabled = true;
	button4.disabled=true;
	button5.disabled=true;
	const submenu = document.getElementById("submenu");
	const otherButtons = document.querySelectorAll(".menu-item:not(:first-child)");
	
	menuButton.addEventListener("click", function () {
		mainMenu.classList.toggle("show");
	})
	button1.addEventListener("click", function () {
		submenu.classList.toggle("show");
	});
	
	convergenceButton.addEventListener("click", function () {	
        if (convergenceButton.textContent === "Add convergence") {
            convergenceButton.textContent = "Remove convergence";
            convergenceButton.classList.add("selected-button");
            plotConvergence();
            
        } else {
            convergenceButton.textContent = "Add convergence";
            convergenceButton.classList.remove("selected-button");
            Plotly.purge('plotDiv2');
            eventosAsignados2=false;
            plotInitializedC=false;
            traceC=[];
            document.getElementById("plotDiv2").style.border = "4px solid transparent";
            //removeConvergence(); 
        }
	});
			
	convergenceButton.disabled=true;
	var showSymbolic=true;
	button5.addEventListener("click", function () {
		if(showSymbolic){
			showSymbolic=false;
			button5.textContent = "Show Symbolic Model";
			
		}
		else{
			showSymbolic=true;
			button5.textContent="Hide Symbolic Model";
		}
		var lastFunction=rememberF();
		console.log(lastFunction);
		if(lastFunction===2){
		    showAllPoints();
		   }
		   else if(lastFunction===3)
		   {
				actualizarGrafica(slider.value);
		   }
		   else if(lastFunction===4)
		   {
				actualizarG2(slider.value);
		   }
	});
			
			
	button2.addEventListener("click", function () {
			
        if (button2.textContent === "Disable Table Selection Mode") {
            button2.textContent = "Enable Table Selection Mode";
            modo2=true;
            disableTable();
            const rows = document.querySelectorAll("#legendDiv tr"); // Selecciona todas las filas dentro de la tabla
            rows.forEach(row => {
                const index = row.getAttribute("data-index"); 
                if (index !== null) {
                    selectedRows.delete(index); // Remueve el índice del conjunto de filas seleccionadas
                                
                    // Remueve la clase "selected" de TODAS las celdas en la fila
                    row.querySelectorAll("td").forEach(cell => cell.classList.remove("selected"));
                }
            });
                    
        } else {
            button2.textContent = "Disable Table Selection Mode";
            modo2=false;
        }
	});
			
	button3.addEventListener("click", function () {
		if (button3.textContent === "Disable Hover") {
			button3.textContent = "Enable Hover";
			removedHover=true;
			removeHoverEvents();
		} else {
			button3.textContent = "Disable Hover";
			removedHover=false;
			asignarEventosHover();
		}
	});

	otherButtons.forEach(button => {
		button.addEventListener("click", function () {
			submenu.classList.remove("show");
		});
	});
			
			

    // funcion para seleccionar csv
    function promptForCSVFile() {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.style.display = 'none'
        fileInput.addEventListener('change', function (event) {
            var file = event.target.files[0];
					
			if (!file){
				uploadFile=false;
				return ;
	
			}
					
            var reader = new FileReader();

            reader.onload = function (e) {
                var csvData = e.target.result;
                processData(csvData);
            };

            reader.readAsText(file);
            // Reset play button text to "Play" when selecting a new CSV file
            /*playButton = document.getElementById('playButton');
            playButton.textContent = 'Play';
			playButton.disabled=false;
			showAllButton.disabled=false;
					  
			*/
					  
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }
    // Funcion para limpiar la tabla
    function clearLegendTable() {
        var legendDiv = document.getElementById('legendDiv');
        legendDiv.innerHTML = ''; // Clear the legend table content
    }

    // limpiar plot
    function clearPlot() {
        Plotly.purge('plotDiv'); // Clear the plot
        document.getElementById("plotDiv").style.border = "4px solid transparent";
        document.getElementById("plotDiv2").style.border = "4px solid transparent";
        firstClick=true;
        symbolAll=[];
        lastTraceExist=false;
        lastValuesLoaded=false;
        rememberF(0);
        modo=null;
        document.getElementById("loadLastValuesButton").classList.remove("selected-button");
        traceC=[];
        firstPositive=null;
        secondPositive=null;
        plotInitializedC=false;
        eventosAsignados2=false;
    // Seleccionar todos los botones del submenú
        const botones = submenuEscala.querySelectorAll("button");
        const btnRestore = document.getElementById("btnRestore");

        // Asegurar que el botón "Restaurar" aparezca como presionado al inicio
        btnRestore.style.backgroundColor = "blue";
        btnRestore.style.color = "white";
        btnRestore.onmouseover = function () {
            btnRestore.style.backgroundColor = "#0033cc";
        };
        btnRestore.onmouseleave = function () {
            btnRestore.style.backgroundColor = "blue";
        };
        cambioEscala=false;
	    // Resetear colores de todos los botones antes de cambiar el del seleccionado
        botones.forEach((btn) => {
            btn.style.backgroundColor = ""; // Restaurar color original
            btn.style.color = ""; // Restaurar color de texto original
            btn.onmouseover = null; // Eliminar efecto hover personalizado
            btn.onmouseleave = null;
        });
        convergenceButton.textContent = "Add convergence";
        convergenceButton.classList.remove("selected-button");	
        convergenceButton.disabled=true;
        loadLastValuesButton.disabled=true;
        Plotly.purge('plotDiv2');	
}

    var modo=null;
    var trace=[];

	window.addEventListener('resize', function() {
		console.log('Ajustando ',modo);
		if (modo === 'A') {
		    updatePlotSize(1);
		} else if (modo === 'B') {
		    updatePlotSize(0);
		}
	});
 
    let firstPositive = null;
    let secondPositive = null;


    // Procesamiento de datos
    async function processData(csvData) { 

        const filas = csvData.trim().split('\n');
        const numeroDeColumnas = filas[0].split(',').length;
        console.log("Número de columnas:", numeroDeColumnas);
        var values=0;

        const valido = await validarColsActive(colsActive, numeroDeColumnas);
        if (!valido) return;
    
        // Clear existing legend table and plot
        clearLegendTable();
        clearPlot();

        button5.disabled=true;
        button4.disabled=true;
        activarBotones();
        document.getElementById('bienvenida').style.display = 'none';
        document.getElementById('instrucciones').style.display = 'none';

        parsedData = filas.slice(1).map(function(row) { 
            values = row.trim().split(',');
            var generation = parseFloat(values[2]); // Valor de la generación (tercera columna)
            var dataValues = values.slice(0, 2).map(function(val) {
                return parseFloat(val.trim());
            }); // Obtener valores de las dos primeras columnas
            
            var dataValues2 = values.slice(3, 5).map(function(val) {
                return parseFloat(val.trim());
            }); // Columnas 2 y 3

            var generation2 = parseFloat(values[5]); 		
        
            var isBest = (colsActive[0] > 0 && values.length > colsActive[0]) ? parseInt(values[colsActive[0]]) : undefined;
            var train = (colsActive[1] > 0 && values.length > colsActive[1]) ? parseFloat(values[colsActive[1]]) : undefined;
            var trainNormalized = (colsActive[2] > 0 && values.length > colsActive[2]) ? parseFloat(values[colsActive[2]]) : undefined;
            var test = (colsActive[3] > 0 && values.length > colsActive[3]) ? parseFloat(values[colsActive[3]]) : undefined;
            var testNormalized = (colsActive[4] > 0 && values.length > colsActive[4]) ? parseFloat(values[colsActive[4]]) : undefined;
            var size = (colsActive[5] > 0 && values.length > colsActive[5]) ? parseInt(values[colsActive[5]]) : undefined;
            var sizeNormalized = (colsActive[6] > 0 && values.length > colsActive[6]) ? parseFloat(values[colsActive[6]]) : undefined;
            var expression = (colsActive[7] > 0 && values.length > colsActive[7]) ? values[colsActive[7]] : undefined;
    
            return [dataValues, dataValues2, generation, generation2, isBest, train, trainNormalized, test, testNormalized, size, sizeNormalized, expression];
        });

        console.log("val",values.length);
        // Extraer valores y generaciones
        Values = [];
        Values2 = []; // <-- nueva lista para dataValues2
        generations = [];
        generations2 = [];
        IDs = [];
        isBestValues = [];
        trainValues = [];
        trainNormalizedValues = [];
        testValues = [];
        testNormalizedValues = [];
        sizeValues = [];
        sizeNormalizedValues = [];
        expressions = [];
        var id = 0;

        parsedData.forEach(function(data) {
            var dataValues = data[0];
            var dataValues2 = data[1];
            var generation = data[2];
            var generation2 = data[3];
            var isBest = data[4];
            var train = data[5];
            var trainNormalized = data[6];
            var test = data[7];
            var testNormalized = data[8];
            var size = data[9];
            var sizeNormalized = data[10];
            var expression = data[11];

            Values.push(dataValues[dataValues.length - 1]);
            Values2.push(dataValues2[dataValues2.length - 1]); // <-- guarda el último valor de dataValues2

            generations.push(generation);
            generations2.push(generation2);
            IDs.push(id);
            isBestValues.push(isBest !== undefined ? isBest : null); 
            trainValues.push(train !== undefined ? train : null); 
            trainNormalizedValues.push(trainNormalized !== undefined ? trainNormalized : null); 
            testValues.push(test !== undefined ? test : null); 
            testNormalizedValues.push(testNormalized !== undefined ? testNormalized : null);
            sizeValues.push(size !== undefined ? size : null); 
            sizeNormalizedValues.push(sizeNormalized !== undefined ? sizeNormalized : null); 
            expressions.push(expression !== undefined ? expression : null);

            id += 1;
            
        });

        
        defaultSizes = new Array(parsedData.length+3).fill(8);
        console.log("IDs",IDs);
        
        console.log(sizeValues);
        console.log("trainNormalizedValues:",trainNormalizedValues);
        console.log(sizeNormalizedValues);
        // Filtrar solo valores válidos (números reales)
        let validGenerations = generations.filter(g => typeof g === 'number' && !isNaN(g));

        howManyGenerations = Math.max(...validGenerations);
        console.log("La generación más grande encontrada es:", howManyGenerations);

        // Extraer los últimos valores de cada generación
        var lastValues = extractLastValues(parsedData);
        console.log('Last Values:', lastValues);

        for (let i = 0; i < generations.length; i++) {
            if (generations[i] > 0) {
                if (firstPositive === null) {
                    firstPositive = generations[i];
                } else if (generations[i] !== firstPositive) {
                    secondPositive = generations[i];
                    break;
                }
            }
        }

        console.log("Primer número positivo:", firstPositive);
        console.log("Segundo número positivo diferente:", secondPositive);

        // Función para extraer el último valor de cada generación
        function extractLastValues(data) {
            var lastValues = {};
            data.forEach(function(row) {
                var generation = row[1];
                if (generation >= 5) {
                    var component1 = row[0][0];
                    var component2 = row[0][1];
                    lastValues[generation] = { component1: component1, component2: component2 };
                }
            });
            return lastValues;
        }


        // Initialize play button
        playButton.addEventListener('click', togglePlay);
                    
        var convergenceButton = document.getElementById('convergenceButton');
                    
        convergenceButton.style.backgroundColor = "dark red";
        showAllButton.addEventListener('click', showAllPoints);

        // Inicializar barra y caja de texto
        const slider = document.getElementById('slider');
        const numeroPuntos = document.getElementById('numeroPuntos');
        slider.disabled = false;
        numeroPuntos.disabled = false;
        slider.step = secondPositive-firstPositive;
        numeroPuntos.step=secondPositive-firstPositive;
        numeroPuntos.min=firstPositive;
        numeroPuntos.value=firstPositive;
        slider.max = howManyGenerations;
        slider.min=firstPositive;
        slider.value=firstPositive;
                    
        // Ajustar el valor del slider si supera el nuevo máximo
        if (parseInt(slider.value, firstPositive) > howManyGenerations) {
            slider.value = howManyGenerations;
        }
                    
        numeroPuntos.max = howManyGenerations;
                    
        // Ajustar el valor de la caja de texto si supera el nuevo máximo
        if (parseInt(numeroPuntos.value, firstPositive) > howManyGenerations) {
            numeroPuntos.value = howManyGenerations;
        }
                                    
        //Inicializar tabla tactil
        const tableBody = document.querySelector('#legendDiv');
        //const toggleUnselectedBtn = document.getElementById('toggleUnselectedBtn'
        
        //tableBody.style.pointerEvents = 'none'; 
        button1.disabled = false;
        button2.disabled = false;
        button3.disabled = false;
        colors = generateColors(generations); // Generate colors based on unique generations
        plotInitialized = true;
        verificarArraysYMostrarSubmenu(generations, trainNormalizedValues, testNormalizedValues, sizeNormalizedValues);
        // Create color legend table
        createColorLegend(generations, colors);
    }

	// Attach event listener to the button
	loadLastValuesButton.addEventListener('click', toggleLastElements);

    // Function to update plot based on current index
    function updatePlot() {
        Plotly.animate('plotDiv', {
            data: [{ x: [parsedData[currentIndex][0][0]], y: [parsedData[currentIndex][0][1]] }],
            traces: [0],
            layout: {}
        }, {
            transition: { duration: 0 },
            frame: { duration: 0, redraw: false },
        });
    }

// Identacion corregida hasta aqui

// Variable to track animation state
var animationPaused = false;
var animationTimeout; // Variable to store timeout reference
var showAllActive=false;
var firstClick=true;
var llamado=0;
let botonesVisibles=0;

let modalCallback = null;

function showCustomModal(message, buttons = ['Use extra columns', "Don't use extra columns", 'Cancel']) {
  return new Promise((resolve) => {
    const modal = document.getElementById("custom-modal");
    const text = document.getElementById("custom-modal-text");
    const buttonsContainer = document.getElementById("custom-modal-buttons");

    text.textContent = message;
    buttonsContainer.innerHTML = ''; // Limpiar botones anteriores

    buttons.forEach(label => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.onclick = () => {
        modal.style.display = "none";
        resolve(label);
      };
      buttonsContainer.appendChild(btn);
    });

    modal.style.display = "block";
  });
}


function handleModalResponse(action) {
  document.getElementById("custom-modal").style.display = "none";
  if (modalCallback) {
    modalCallback(action);
    modalCallback = null;
  }
}

function activarBotones(){
	playButton = document.getElementById('playButton');
    playButton.textContent = 'Play';
	playButton.disabled=false;
	showAllButton.disabled=false;
}

async function validarColsActive(colsActive, numeroDeColumnas) {
  const fueraDeRango = colsActive.filter(i => i !== 0 && i >= numeroDeColumnas);

  // Si se encuentran columnas fuera de rango
  if (fueraDeRango.length > 0) {
    const columnas = fueraDeRango.join(', ');

    const respuesta = await showCustomModal(
      `⚠️ Warning: The following active columns are outside the allowed range (0 - ${numeroDeColumnas - 1}): ${columnas}.\n\nClick "OK" to continue at your own risk (invalid columns will be skipped), or "Cancel" to abort.`,
      ['OK', 'Cancel'] // Solo dos botones
    );

    if (respuesta === 'OK') {
      for (let i = 0; i < colsActive.length; i++) {
        if (colsActive[i] !== 0 && colsActive[i] >= numeroDeColumnas) {
          colsActive[i] = 0;
        }
      }
      // Llamar a la función para actualizar la tabla con los nuevos valores de colsActive
      actualizarTabla(colsActive);
      return true;
    } else {
      return false;
    }
  }
	const columnasActivas = colsActive.filter(i => i !== 0);
	const columnasTeoricas = numeroDeColumnas - 6;

	if (columnasActivas.length < columnasTeoricas) {
	  const respuesta = await showCustomModal(
		"⚠️ Some columns are not activated. What do you want to do?",
		['Activate all extra columns', "Use only selected columns", 'Cancel']
	  );

	  if (respuesta === 'Activate all extra columns') {
		for (let i = 6; i < numeroDeColumnas; i++) {
		  colsActive[i - 6] = i;
		}
		actualizarTabla(colsActive);
		return true;
	  } else if (respuesta === "Use only selected columns") {
		// NO cambiamos nada, usamos lo que el usuario activó manualmente
		actualizarTabla(colsActive);
		return true;
	  } else {
		return false;
	  }
	}


  return true;
}

// Función para actualizar el estado de la tabla según los valores de colsActive
function actualizarTabla(colsActive) {
  // Recorrer todas las filas de la tabla (solo de la columna 5 en adelante)
  const filas = document.querySelectorAll('#table-body tr');
  filas.forEach((tr, index) => {
    // Ignorar las filas de la 0 a la 4
    if (index < 6) return;

    const td1 = tr.querySelector('td');
    const td2 = tr.querySelector('td:nth-child(2)');

    if (colsActive[index - 6] !== 0) {
      // Si está activada, eliminar el estado inactivo
      td1.classList.remove('mini-inactive');
      td2.textContent = ''; // Deja el texto vacío
      td2.classList.remove('mini-x-cell');
    } else {
      // Si está inactiva, agregar el estado inactivo
      td1.classList.add('mini-inactive');
      td2.textContent = 'X';
      td2.classList.add('mini-x-cell');
    }
  });

  // Llamar a la función de reenumeración si es necesario
  reenumerar();
}

 

function verificarArraysYMostrarSubmenu(generations, trainNormalizedValues, testNormalizedValues, sizeNormalizedValues) {
    // Función para verificar si un array es completamente válido según generation
	console.log("Verificando...");
    function esArrayCompleto(valuesArray) {
        return generations
            .map((gen, index) => ({ gen, value: valuesArray[index] })) // Asociamos generación con el valor
            .filter(item => Number.isInteger(item.gen) && item.gen > 0) // Filtramos generaciones válidas
            .every(item => item.value != null && !isNaN(item.value));   // Verificamos que TODOS los valores sean válidos
    }

    // Verificar si cada conjunto está completo
    let trainCompleto = esArrayCompleto(trainNormalizedValues);
    let testCompleto = esArrayCompleto(testNormalizedValues);
    let sizeCompleto = esArrayCompleto(sizeNormalizedValues);

    // Mensajes en consola para debug
    if (!trainCompleto) console.log("El array trainNormalizedValues está incompleto");
    if (!testCompleto) console.log("El array ValidationNormalizedValues está incompleto");
    if (!sizeCompleto) console.log("El array sizeNormalizedValues está incompleto");
    if (trainCompleto && testCompleto && sizeCompleto) console.log("Todos los arrays están completos");
	
		function obtenerPromedioEnGeneracionesPositivas(arreglo, generations) {
		const valores = [];

		for (let i = 0; i < arreglo.length; i++) {
			if (generations[i] > 0) {
				const val = arreglo[i];
				if (val !== null && val !== undefined && val !== '' ) {
					valores.push(val);
				}
			}
		}

		if (valores.length === 0) return null;

		const min = Math.min(...valores);
		const max = Math.max(...valores);
		return (min + max) / 2;
	}

	function reemplazarValoresVaciosConPromedio(arreglo, nombre, generations) {
		const promedio = obtenerPromedioEnGeneracionesPositivas(arreglo, generations);

		if (promedio === null) {
			console.warn(`No se pudo calcular el promedio para ${nombre} (no hay datos con generation > 0)`);
			return;
		}

		for (let i = 0; i < arreglo.length; i++) {
			if (generations[i] < 0) {
				const val = arreglo[i];
				if (val === null || val === undefined || val === '' || Number.isNaN(val)) {
					console.log(`${nombre}[${i}] estaba vacío y se reemplazó con el promedio ${promedio}`);
					arreglo[i] = promedio;
				}
			}
		}
	}

	if (trainCompleto) {
		reemplazarValoresVaciosConPromedio(trainNormalizedValues, 'trainNormalizedValues', generations);
	}
	if (testCompleto) {
		reemplazarValoresVaciosConPromedio(testNormalizedValues, 'testNormalizedValues', generations);
	}
	if (sizeCompleto) {
		reemplazarValoresVaciosConPromedio(sizeNormalizedValues, 'sizeNormalizedValues', generations);
	}


    // Seleccionar el botón "Cambiar escala" y el submenú
    const button4 = document.querySelector("#mainMenu .menu-item:nth-child(5)");
    const submenuEscala = document.getElementById("submenu-escala");
    const btnRestore = document.getElementById("btnRestore"); // Botón "Restaurar"

    if (!button4 || !submenuEscala) return; // Si no existen, salir

    // Mostrar/ocultar botones según los arrays
    document.getElementById("btnTrain").style.display = trainCompleto ? "block" : "none";
    document.getElementById("btnTest").style.display = testCompleto ? "block" : "none";
    document.getElementById("btnSize").style.display = sizeCompleto ? "block" : "none";

    // Verificar cuántos botones están visibles
    botonesVisibles = [trainCompleto, testCompleto, sizeCompleto].filter(v => v).length;
	
    // Si hay al menos un botón visible, asegurarse de que el botón "Restaurar" esté presente
    if (botonesVisibles > 0) {
        btnRestore.style.display = "block";
        btnRestore.disabled = true;
    } else {
        btnRestore.style.display = "none";
		button4.disabled=true;
    }

    // Inicialmente ocultar el submenú
    submenuEscala.style.display = "none";

		// Función para alternar el submenú
	function toggleSubmenu(event) {
		event.stopPropagation(); // Evita que el clic cierre el submenú
		console.log("Botón presionado, botones visibles:", botonesVisibles);

		if (botonesVisibles > 0) {
			submenuEscala.style.display = (submenuEscala.style.display === "none") ? "flex" : "none";
		}
	}

	// Verificamos si el evento ya fue agregado
	if (!button4.dataset.listenerAdded) {
		button4.addEventListener("click", toggleSubmenu);
		button4.dataset.listenerAdded = "true"; // Marcamos que el evento ya fue asignado
	}

    // Evento global para ocultar el submenú al hacer clic en otro botón del menú
    document.querySelectorAll("#mainMenu .menu-item").forEach((button) => {
        if (button !== button4) { // Excluimos el botón "Cambiar escala"
            button.addEventListener("click", function () {
                submenuEscala.style.display = "none"; // Ocultar submenú si se hace clic en otro botón
            });
        }
    });

    asignarEventosSubmenu(trainNormalizedValues, testNormalizedValues, sizeNormalizedValues);
}


let normalizedValues;

function asignarEventosSubmenu(trainNormalizedValues, testNormalizedValues, sizeNormalizedValues) {
    const submenuEscala = document.getElementById("submenu-escala");
    if (!submenuEscala) return; // Si no hay submenú, salir

    // Definir el orden lógico de los botones
    const ordenBotones = ["Training", "Validation", "Model Size", "Default"];
	console.log("Agregando...");
	
    // Seleccionar todos los botones del submenú
    const botones = submenuEscala.querySelectorAll("button");
	
	const btnRestore = document.getElementById("btnRestore");

    // Asegurar que el botón "Restaurar" aparezca como presionado al inicio
    btnRestore.style.backgroundColor = "blue";
    btnRestore.style.color = "white";
    btnRestore.onmouseover = function () {
        btnRestore.style.backgroundColor = "#0033cc";
    };
    btnRestore.onmouseleave = function () {
        btnRestore.style.backgroundColor = "blue";
    };


    botones.forEach((boton) => {
        boton.addEventListener("click", function () {
            // Buscar en qué posición lógica está este botón
            const posicion = ordenBotones.indexOf(boton.innerText) + 1;
            console.log("Botón presionado:", posicion);
			
			  // Resetear colores de todos los botones antes de cambiar el del seleccionado
            botones.forEach((btn) => {
                btn.style.backgroundColor = ""; // Restaurar color original
                btn.style.color = ""; // Restaurar color de texto original
                btn.onmouseover = null; // Eliminar efecto hover personalizado
                btn.onmouseleave = null;
            });

            // Cambiar el color del botón presionado
            boton.style.backgroundColor = "blue";
            boton.style.color = "white"; // Ajustar color del texto para mejor visibilidad

            // Cambiar el color del hover
            boton.onmouseover = function () {
                boton.style.backgroundColor = "#0033cc"; // Azul más oscuro en hover
            };
            boton.onmouseleave = function () {
                boton.style.backgroundColor = "blue"; // Mantener azul al salir
            };

			if(posicion=== 1 || posicion=== 2 || posicion=== 3 )
			{
			 cambioEscala=true;
			 btnRestore.disabled=false;
			}

            // Asignar los valores correspondientes a defaultSizes
            if (posicion === 1) {
                normalizedValues = trainNormalizedValues;
            } else if (posicion === 2) {
                normalizedValues = testNormalizedValues;
            } else if (posicion === 3) {
                normalizedValues = sizeNormalizedValues;
            }
			else if (posicion === 4) {
                cambioEscala=false;
				btnRestore.disabled=true;
            }
			defaultSizes=ajustarTamanosDePuntos(normalizedValues);
			GuardarDefaultsizes=defaultSizes;
			if(control)
			{
				console.log('Valor',slider.value);
				if (button2.textContent === "Disable Table Selection Mode")
				{
				actualizarGrafica(slider.value);
				}
				else
				{
				actualizarG2(slider.value);
				}
				console.log('1')
			}
			else if(posicion===4)
			{
			Plotly.restyle(plotDiv, { "marker.size": [8] }, [0]);
			defaultSizes = new Array(IDs.length).fill(8);

				console.log('2')
			}
			else{
			Plotly.restyle(plotDiv, { "marker.size": [defaultSizes] }, [0]);
			
				console.log('3')
			}
        });
    });
}

				let GuardarDefaultsizes;
function ajustarTamanosDePuntos(normalizedValues) {
    // Rango de tamaños de puntos (puedes ajustarlo según tus necesidades)
    const tamanioMaximo = 20;
    const tamanioMinimo = 8;

    // Calcula el tamaño de cada punto basado en el valor normalizado
    let tamanos = normalizedValues.map(value => {
        return tamanioMinimo + (tamanioMaximo - tamanioMinimo) * value;
    });

    return tamanos;
}






const tableBody = document.querySelector('#legendDiv');
  const buttons = document.querySelectorAll("#selectFileButton, #customizeFile, #playButton, #showAllButton");



    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Si el botón ya está seleccionado, lo deseleccionamos
			
			/*if(this!=loadLastValuesButton)
			{
				if(lastValuesLoaded)
				{
				 removeLastElements();
				}
			}
			*/
			if(this!==selectFileButton)
			{
			  dropdownMenu.style.display ="none";
			}
			

				
						// Primero, eliminamos la selección de todos los botones
						buttons.forEach(btn => btn.classList.remove("selected-button"));
						
						// Luego, agregamos la clase solo al botón presionado
						this.classList.add("selected-button");	
							
				if(this!==selectFileButton && this!==customizeFile){
					document.getElementById("plotDiv").style.border = "4px solid black";
					
				}
        });
		
		
    });
	
	function deselectButtons() {
    const buttons = document.querySelectorAll("#selectFileButton, #playButton, #showAllButton");
    buttons.forEach(button => button.classList.remove("selected-button"));
}
 
 function habilitarBotonesMenu()
 {
		button3.disabled=false;
		button1.disabled=false;
		if(botonesVisibles>0)
		{
		button4.disabled=false;
		}
		else
		{
		button4.disabled=true;
		}
		if(colsActive[7]===0)
		{
		button5.disabled=true;
		}
		else{
		button5.disabled=false;
		}
		loadLastValuesButton.disabled=false;
		
		convergenceButton.disabled = !ValidarConvergence();
 }

	function ValidarConvergence(){
		if (
			Array.isArray(trainValues) &&
			trainValues.length > 0 &&
			trainValues.every(item => item != null && !isNaN(item)) &&
			 Array.isArray(isBestValues)
			&& isBestValues.length > 0 && isBestValues.every(item => item != null && !isNaN(item)) 
		)
		{
			return true;
		}
		
		return false;
	
	}
	
	

 document.getElementById("btn-viridis").addEventListener("click", function () {
        updateColorMap("viridis");
    });
    document.getElementById("btn-magma").addEventListener("click", function () {
        updateColorMap("magma");
    });
    document.getElementById("btn-cividis").addEventListener("click", function () {
        updateColorMap("cividis");
    });
    document.getElementById("btn-blue-red").addEventListener("click", function () {
        updateColorMap("blue-red");
    });
    document.getElementById("btn-purple-pink").addEventListener("click", function () {
        updateColorMap("purple-pink");
    });
    document.getElementById("btn-spectrum").addEventListener("click", function () {
        updateColorMap("spectrum");
    });
	var changeColor=false;
	 function updateColorMap(map) {
            currentColorMap = map;
			changeColor=true;
			colors=generateColors(generations);
            updateTableColors(colors,generations);
         
		   var lastFunction=rememberF();
			if(lastFunction!=1)
			{
			   if(lastFunction===2)
			   {
					showAllPoints();
			   }
			   else if(lastFunction===3)
			   {
					actualizarGrafica(slider.value);
			   }
			   else if(lastFunction===4)
			   {
					actualizarG2(slider.value);
			   }
		   }
		     if(plotInitializedC)
		   {
			plotConvergence();
		   }
    }
	

function updateTableColors(newColors, generations) { 
    console.log('Actualizar colores');

    let table = document.querySelector("#legendDiv table");
    if (!table) return;

    let rows = table.getElementsByTagName("tr");
    let uniqueGenerations = [...new Set(generations)];

    for (let i = 1; i < rows.length; i++) {
        let generation = rows[i].getAttribute("data-index");
        if (!generation) continue;

        let lastIndex = generations.lastIndexOf(parseInt(generation));
        let cell = rows[i].cells[1];
        if (cell && lastIndex !== -1) {

            if (generation === '-1' || generation === '-2' || generation === '-3' || generation === '-5') {
                // 🎯 Encontrar el símbolo por clase
                let symbolSpan = cell.querySelector('.legend-symbol');
                if (symbolSpan) {
                    symbolSpan.style.color = newColors[lastIndex];
                }
            } else {
                cell.style.backgroundColor = newColors[lastIndex];
            }
        }
    }
}


 const legendDiv = document.getElementById('legendDiv');
// Set para almacenar los índices de las filas seleccionadas
const selectedRows = new Set();
// Evento en la tabla: al hacer clic en una fila, se alterna su selección.
document.getElementById('legendDiv').addEventListener('click', function(e) {
    const row = e.target.closest('tr'); 
    if (!row || !row.hasAttribute('data-index')) return;

    var index = row.getAttribute('data-index'); 
    const generation = parseInt(index); // Convertir el índice a número
    console.log('Índice de la fila:', index);
    
    const selectedColor = row.cells[1].style.backgroundColor;  

    if (selectedRows.has(index)) {
        // Si el índice ya está en el Set, significa que ya está en la gráfica → Eliminarlo
        selectedRows.delete(index);
        //row.classList.remove('selected'); 
		 row.cells[0].classList.remove('selected');
        removeTrace(index);
       // console.log('QUITAR ALGO QUE YA ESTA');

        // Si la generación fue agregada manualmente, quitarla de la lista
        if (manualSelectedGenerations.has(generation)) {
            manualSelectedGenerations.delete(generation);
			
			const removedIndex = removedRows.indexOf(index); //MODIFICADO AQUI, para que se recupere al mover el slider
            removedRows.splice(removedIndex, 1);
        } else {
            // Si no estaba en `manualSelectedGenerations`, agregarla a `removedRows`
            if (!removedRows.includes(index)) {
                removedRows.push(index);
            }
        }

    } else {
        // Si no está en el Set, agregarlo y dibujar el trazo
        selectedRows.add(index);
        
        // Solo agregar la clase 'selected' a la primera celda
        row.cells[0].classList.add('selected'); 
		
        // Si estaba en `removedRows`, quitarlo de ahí
        const removedIndex = removedRows.indexOf(index);
		console.log("removedIndex",removedIndex);
        if (removedIndex !== -1) {
            removedRows.splice(removedIndex, 1);
            console.log('Eliminado de removedRows');
        }
		else{
		
        manualSelectedGenerations.add(generation);
		}

        actualizarGrafica(valor);
		
    }
	
});


	
	function RowChart(RowValue,selectedColor) {
		var xAll = [];
		var yAll = [];
		showAllActive=false;
		control=false;
		var textAll= [];
		var symbolAll=[];
		var LimitUp=true;
		for (let index = 0; index < parsedData.length; index++) {
		  const item = parsedData[index];
		  const data = item[0]; // Obtenemos el arreglo de datos: [x, y]
		  const generation = generations[index];
		  const Value = Values[index];

		  if (generation===Number(RowValue)) {
			  LimitUp=false;
				 // Asegurarse de que las coordenadas sean arrays
			  const xData = Array.isArray(data[0]) ? data[0] : [data[0]];
			  const yData = Array.isArray(data[1]) ? data[1] : [data[1]];

			  // Concatenar los datos en los arrays generales
			  xAll = xAll.concat(xData);
			  yAll = yAll.concat(yData);

			  // Generar un texto descriptivo para cada punto
			  const texts = xData.map((_, i) => `Generation: ${generation}, Value: ${Value}`);
			  textAll = textAll.concat(texts);
			  
			  var symbolForGroup = getSymbolForGeneration(generation);
				  // Asignar ese símbolo a cada punto de xData
			  var symbols = xData.map(function() {
			  return symbolForGroup;
					});
			  symbolAll = symbolAll.concat(symbols);
		  }
		  if(!LimitUp && generation!=RowValue)
		  {
			 break;
		  }

		}
		trace = {
		  x: xAll, // Asegúrate de que xAll es un array con los datos del eje x
		  y: yAll, // Asegúrate de que yAll es un array con los datos del eje y
		  text: textAll, // Opcional: array con textos para cada punto
		  hoverinfo: 'x+y+text', 
		  mode: 'markers', // 'markers' para puntos, 'lines' para líneas, 'lines+markers' para ambos
		  type: 'scatter', // Tipo de gráfico, 'scatter' es común para gráficos de dispersión
		  marker: {
                        size: 8,
                        color: selectedColor, // assignacion de colores
						symbol: symbolAll
                    },
          
		  name: `Trace-${RowValue}`,
		  hovertemplate: '%{text}<extra></extra>',
		  customdata: RowValue,
		  showlegend: false,
          size: 16
		 };
		var layout=updatePlotSize(0);
		// Si el gráfico está vacío, crea uno nuevo
		if (!plotDiv.data || plotDiv.data.length === 0) {
			console.log('Gráfico vacío, creando con newPlot');
			Plotly.newPlot('plotDiv', [trace], layout);
		} else {
			Plotly.addTraces('plotDiv', [trace]); 
		}

 }
 var removedRows = [];
 function removeTrace(RowValue) {
    //Buscar el índice del trazo que corresponde a la fila seleccionada
	console.log('control es:',control);
	
	removedRows.push(RowValue);
	if(!control)
	{
		var traceIndex = -1;
		for (let i = 0; i < plotDiv.data.length; i++) {
			if (plotDiv.data[i].customdata===RowValue) { // Usa un identificador único
				traceIndex = i;
				break;
			}
		}

		if (traceIndex !== -1) {
			console.log(`Eliminando trazo en índice: ${traceIndex}`);
			Plotly.deleteTraces('plotDiv', traceIndex);
		}
	}
	else
	{
		actualizarGrafica(valor);
	}
}


function rememberFunction() {
    let lastFunction = true; // Valor inicial por defecto (puedes cambiarlo según lo necesites)

    return function(whatFunction = lastFunction) {
        lastFunction = whatFunction; // Almacena el último valor recibido
        return lastFunction;
    };
}

const rememberF = rememberFunction();



function createUpdatePlotSize() {
    let lastAnimate = true; // Valor inicial por defecto (puedes cambiarlo según lo necesites)

    return function(animate = lastAnimate) {
        lastAnimate = animate; // Almacena el último valor recibido
        return lastAnimate;
    };
}

// Crear la función que recuerda el valor de animate
const rememberAnimate = createUpdatePlotSize();


// Función de ajuste de pantalla
function updatePlotSize(animate) {
    animate = rememberAnimate(animate);
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    
    // Layout para plotDiv1 (grafico 1)
    var layoutUpdatePlot1 = {
        title: {
            text: '2D Projections of Semantic Space',
            font: {
                weight: 'bold',
				family: "Times New Roman, serif",
                size: 36
            }
        },
        xaxis: { 
            title: 'Component 1',
            titlefont: {
                weight: 'bold',
				family: "Times New Roman, serif",
                size: 29
            }
        },
        yaxis: { 
            title: 'Component 2',
            titlefont: {
                weight: 'bold',
				 family: "Times New Roman, serif",
                size: 29
            }
        },
        legend: {
            font: { size: 18 },
            x: 0.6,
            y: 0.01,
            xanchor: 'left',
            yanchor: 'top',
            orientation: 'v'
        },
    };
    
    // Layout para plotDiv2 (grafico 2) que tendrá el título actualizado.
    var layoutUpdatePlot2 = {
        title: {
            text: 'Convergence',
            font: {
                weight: 'bold',
				 family: "Times New Roman, serif",
                size: 36
            }
        },
        xaxis: { 
            title: 'Generation',
            titlefont: {
                weight: 'bold',
				 family: "Times New Roman, serif",
                size: 29
            }
        },
        yaxis: { 
            title: 'Fitness',
            titlefont: {
                weight: 'bold',
				 family: "Times New Roman, serif",
                size: 29
            }
        },
        legend: {
            font: { size: 18 },
            x: 0.6,
            y: 0.01,
            xanchor: 'left',
            yanchor: 'top',
            orientation: 'v'
        },
    };
    
    // Ajustar tamaño de los gráficos basado en el tamaño de la pantalla
    var plotWidth, plotHeight;
    if (screenWidth >= 1200 && screenHeight >= 800) {
        plotWidth = Math.floor(screenWidth * 0.55); 
        plotHeight = Math.floor(screenHeight * 0.55); 
    } else if (screenWidth >= 992 && screenHeight >= 600) {
        plotWidth = Math.floor(screenWidth * 0.5); 
        plotHeight = Math.floor(screenHeight * 0.5); 
    } else {
        plotWidth = Math.floor(screenWidth * 0.9); 
        plotHeight = Math.floor(screenHeight * 0.5); 
    }

    var aspectRatio = 0.90; 
    plotHeight = Math.floor(plotWidth * aspectRatio); 

    // Actualiza los tamaños en el layout
    layoutUpdatePlot1.width = plotWidth;
    layoutUpdatePlot1.height = plotHeight;
    layoutUpdatePlot2.width = plotWidth;
    layoutUpdatePlot2.height = plotHeight;

    // Actualizar gráficos con layouts específicos
    if (animate === 1) {
        Plotly.react('plotDiv', [trace], layoutUpdatePlot1).then(function() {
            nextFrame(); // Comienza la animación
        });
		if(lastTraceExist)
			{
				plotLastElements();
			}
    } else {
			if ((!firstClick && showAllActive) || control) {
				Plotly.react('plotDiv', [trace], layoutUpdatePlot1);
			}
			else if(firstClick && showAllActive)
			{
				
				Plotly.newPlot('plotDiv', [trace], layoutUpdatePlot1); //ULTIMO CAMBIO PARA HOVER
			}
			if(lastTraceExist)
			{
				plotLastElements();
			}
    }

    // Ajustar tamaño de las cajas que contienen los gráficos
    var plotDiv = document.getElementById('plotDiv');
    var plotDiv2 = document.getElementById('plotDiv2');
    var borderWidth = parseInt(window.getComputedStyle(plotDiv).borderWidth);
    var newWidth = plotWidth + 3 * borderWidth;
    var newHeight = plotHeight + 3 * borderWidth;

    plotDiv.style.width = newWidth + 'px';
    plotDiv.style.height = newHeight + 'px';
    plotDiv2.style.width = newWidth + 'px';
    plotDiv2.style.height = newHeight + 'px';

    // Estilos para alinear ambos gráficos en la misma fila
    document.getElementById('plotDiv').style.display = 'inline-block';
    document.getElementById('plotDiv2').style.display = 'inline-block';
    document.getElementById('plotDiv').style.marginRight = '10px';

    // Actualizar plotDiv2 con su layout específico
    if(plotInitializedC) {
	
     Plotly.update('plotDiv2',  traceC,layoutUpdatePlot2);
    }
	
    return layoutUpdatePlot1;  // Retorna el layout para plotDiv1
}



   let ultimoValorValido = parseInt(numeroPuntos.value);
   var symbols=[];
   
   var FinRango=0;
   
		var IndexColor = -1; 
		var IndexColorFinal = -1;
		var NuevoColors = [];
  // Función para actualizar la gráfica, para el slider
  var filteredColors = [];
  var removedGenerations = new Set();
  var manualSelectedGenerations= new Set();
  let deployedIndices = [];
function actualizarGrafica(valor) {
	rememberF(3);
	habilitarBotonesMenu();
	document.getElementById("plotDiv").style.border = "4px solid black";
	dropdownMenu.style.display ="none";
	aux=true;
    deselectButtons();
    //tableBody.style.pointerEvents = 'auto'; // Habilita interacciones nuevamente
	enableTable();
    var xAll = [];
    var yAll = [];
	//modo='B';
    showAllActive = false;
    firstClick = false;
    symbolAll = [];
    control = true;
    var textAll = [];
    filteredColors = []; // Lista para los colores filtrados
    var excludedGenerations = removedRows.map(Number);


    // Remover todas las selecciones previas en la tabla
	 // Remover todas las selecciones previas en la tabla
document.querySelectorAll('#legendDiv tr').forEach(row => {
    if (row.cells.length > 0) {
        row.cells[0].classList.remove('selected'); // Elimina la clase solo de la primera celda
    }
});

	deployedIndices = [];

    selectedRows.clear(); // Reiniciar el conjunto de filas seleccionadas
 let customdataAll = [];
    for (let index = 0; index < parsedData.length; index++) {
        const item = parsedData[index];
        const data = item[0]; // Obtenemos el arreglo de datos: [x, y]
        const generation = generations[index];
        const Value = Values[index];
		var trainCr=trainValues[index];
		var testCr=testValues[index];
		var sizeCr=sizeValues[index];
		var ID = IDs[index];
        var expreCr = expressions[index];
		
        // Si la generación está eliminada, omitirla
        if (removedGenerations.has(generation)) {
            continue;
        }

        // Si la generación está dentro del rango (1 a valor) o fue agregada manualmente, mostrarla
        const dentroDelRango = generation <= valor;
        const agregadaManualmente = manualSelectedGenerations.has(generation);

        if (!dentroDelRango && !agregadaManualmente) {
            continue; // Omitir generaciones que no están en el rango y no fueron agregadas manualmente
        }

        // Omitir generaciones excluidas explícitamente
        if (excludedGenerations.includes(generation)) {
            continue;
        }

        // Marcar la generación como seleccionada
        selectedRows.add(generation.toString());
		var row = document.querySelector(`#legendDiv tr[data-index="${generation}"]`);
		if (row) {
			row.cells[0].classList.add('selected'); // Solo agrega la clase a la primera celda
		}


        // Asegurar que las coordenadas sean arrays
        const xData = Array.isArray(data[0]) ? data[0] : [data[0]];
        const yData = Array.isArray(data[1]) ? data[1] : [data[1]];
		
		  // Guardar los índices de estos elementos
    for (let j = 0; j < xData.length; j++) {
        deployedIndices.push(index); // Guardamos el índice original de cada punto desplegado
    }

        // Concatenar los datos en los arrays generales
        xAll = xAll.concat(xData);
        yAll = yAll.concat(yData);
		var texts = xData.map(function(x, i) {
		let text = "";

		// Lógica para definir el texto de acuerdo al valor de `generation`
		switch (generation) {
			case -1:
				text = "Target Value";
				break;
			case -2:
				text = "Initial Population";
				break;
			case -3:
				text = "Random Trees";
				break;
			case -5:
				text = "Best Individual";
				break;
			default:
				text = `Generation: ${generation}`;
		}

		let extraInfo = "";
		
		if(generation!=-1){
				if (trainCr != null && trainCr !== "" && !isNaN(parseFloat(trainCr))) extraInfo += `<br>Training: ${parseFloat(trainCr).toFixed(4)}`;
				if (testCr != null && testCr !== "" && !isNaN(parseFloat(testCr))) extraInfo += `<br>Validation: ${parseFloat(testCr).toFixed(4)}`;
				if (sizeCr != null && sizeCr !== "" && !isNaN(parseFloat(sizeCr))) {
					extraInfo += Number.isInteger(sizeCr) ? `<br>Size: ${sizeCr}` : `<br>Size: ${parseFloat(sizeCr).toFixed(4)}`;
				}
				if(showSymbolic){
				if (expreCr !== "" && expreCr!=null) extraInfo += `<br>Expression: ${expreCr}`;
				}
			}

		return text + extraInfo; // Se concatena solo si hay datos adicionales
	});
        textAll = textAll.concat(texts);

        // Obtener símbolo para la generación
        var symbolForGroup = getSymbolForGeneration(generation);
        var symbols = xData.map(() => symbolForGroup);
        symbolAll = symbolAll.concat(symbols);

        // Filtrar los colores correspondientes
        filteredColors = filteredColors.concat(colors[index]);
		
					let customDataValues = xData.map(function(_, i) {
				return [generation, IDs[index]]; // Usar el ID real de la variable IDs
			});
			customdataAll = customdataAll.concat(customDataValues);

		
    }
    // Definir tamaños por defecto para cada punto
	if(!cambioEscala){
		defaultSizes = new Array(xAll.length+3).fill(8); // Tamaño inicial de los puntos
	}  else {
	defaultSizes = deployedIndices.map(idx => GuardarDefaultsizes[idx] || 8);
    
	}
    trace = {
        x: xAll,
        y: yAll,
        text: textAll,
        hoverinfo: 'text',
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: defaultSizes, // Usar los tamaños por defecto aquí
            color: filteredColors, // Se usa la lista de colores filtrados
			line: { width: 0 },
            symbol: symbolAll,
			opacity: 1.0 
			
        },
        name: '2D Projections of Semantic Space',
        showlegend: false,
		customdata: customdataAll, // Filtra los NaN
  // Aquí agregamos la generación como customdata
    };
/*
	if(cambioEscala)
	{
		 Object.assign(trace.marker, { size: GuardarDefaultsizes});
		 defaultSizes=GuardarDefaultsizes;
	}
	*/

	  modo='B';
    updatePlotSize(0);
	if(!removedHover)
	{
	asignarEventosHover();
	}
    // Sincronizar controles
    slider.value = valor;
    numeroPuntos.value = valor;
	if(lastValuesLoaded)
	{
		plotLastElements();
		document.getElementById("loadLastValuesButton").classList.add("selected-button");

	}
	

}

     function actualizarG2(valor) {
	 document.getElementById("plotDiv").style.border = "4px solid black";
		rememberF(4);
		  dropdownMenu.style.display ="none";
	  //tableBody.style.pointerEvents = 'none'; 
	  habilitarBotonesMenu();
	  disableTable();
	  changeControl=true;
	  changeControl2=true;
	 modo='B';
	  let customdataAll=[];
		
		deselectButtons();
		var xAll = [];
		var yAll = [];
		showAllActive=false;
		firstClick=false;
		symbolAll=[];
		control=true;
		var textAll= [];
		for (let index = 0; index < parsedData.length; index++) {
		  const item = parsedData[index];
		  const data = item[0]; // Obtenemos el arreglo de datos: [x, y]
		  const generation = generations[index];
		  const Value = Values[index];
			var trainCr=trainValues[index];
			var testCr=testValues[index];
			var sizeCr=sizeValues[index];
		
        var expreCr = expressions[index];	
		
		  if (generation > valor) {
            currentIndex = index;
            break;
        } else if (index === (parsedData.length - 1)) {
            currentIndex = index + 1;
        }

		  // Asegurarse de que las coordenadas sean arrays
		  const xData = Array.isArray(data[0]) ? data[0] : [data[0]];
		  const yData = Array.isArray(data[1]) ? data[1] : [data[1]];

		  // Concatenar los datos en los arrays generales
		  xAll = xAll.concat(xData);
		  yAll = yAll.concat(yData);

		 // Generar un texto descriptivo para cada punto
				var texts = xData.map(function(x, i) {
			let text = "";

			// Lógica para definir el texto de acuerdo al valor de `generation`
			switch (generation) {
				case -1:
					text = "Target Value";
					break;
				case -2:
					text = "Initial Population";
					break;
				case -3:
					text = "Random Trees";
					break;
				case -5:
					text = "Best Individual";
					break;
				default:
					text = `Generation: ${generation}`;
			}

			let extraInfo = "";
			
			if(generation!=-1){
				if (trainCr != null && trainCr !== "" && !isNaN(parseFloat(trainCr))) extraInfo += `<br>Training: ${parseFloat(trainCr).toFixed(4)}`;
				if (testCr != null && testCr !== "" && !isNaN(parseFloat(testCr))) extraInfo += `<br>Validation: ${parseFloat(testCr).toFixed(4)}`;
				if (sizeCr != null && sizeCr !== "" && !isNaN(parseFloat(sizeCr))) {
					extraInfo += Number.isInteger(sizeCr) ? `<br>Size: ${sizeCr}` : `<br>Size: ${parseFloat(sizeCr).toFixed(4)}`;
				}
				if(showSymbolic){
				if (expreCr !== "" && expreCr!=null) extraInfo += `<br>Expression: ${expreCr}`;
				}
			}

			return text + extraInfo; // Se concatena solo si hay datos adicionales
		});

		textAll = textAll.concat(texts);
		  
		  var symbolForGroup = getSymbolForGeneration(generation);
			  // Asignar ese símbolo a cada punto de xData
		  symbols = xData.map(function() {
		  return symbolForGroup;
				});
		  symbolAll = symbolAll.concat(symbols);
		
				 let customDataValues = xData.map(function(_, i) {
			return [generation, IDs[index]]; // Usar el ID real de la variable IDs
		});
		customdataAll = customdataAll.concat(customDataValues);

		
    }
 
    // Definir tamaños por defecto para cada punto
	if(!cambioEscala){
		//defaultSizes = 8; // Tamaño inicial de los puntos
		defaultSizes = new Array(parsedData.length+3).fill(8);
	}
	else{
		defaultSizes=GuardarDefaultsizes;
	}
    trace = {
        x: xAll,
        y: yAll,
        text: textAll,
        hoverinfo: 'text',
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: defaultSizes, // Usar los tamaños por defecto aquí, ESTO ES LO QUE AFECTA
            color: colors, // Se usa la lista de colores filtrados
			line: { width: 0 },
            symbol: symbolAll,
			opacity: 1.0 
			
        },
        name: '2D Projections of Semantic Space',
        showlegend: false,
		customdata: customdataAll, // Filtra los NaN
  // Aquí agregamos la generación como customdata
    };
		 
		if(plotInitialized)
		{
			updatePlotSize(0);
		}
		else{
			Plotly.restyle('plotDiv', [trace], [0]);
			console.log('SEGUNDO');
		}
      // Sincronizar ambos controles
		  slider.value = valor;
		  numeroPuntos.value = valor;
		
		if(!removedHover)
		{
		asignarEventosHover();
		}
		
		if(lastValuesLoaded)
		{
			plotLastElements();
			document.getElementById("loadLastValuesButton").classList.add("selected-button");

		}
		
if (
    Array.isArray(trainValues) &&
    trainValues.length > 0 &&
    trainValues.every(item => item != null && !isNaN(item))
) {
    convergenceButton.disabled = false;
} else {
    convergenceButton.disabled = true; // se desactiva si hay null, NaN o si está vacío
}


    }
let hoverTimeout;
let lastMousePos = { x: 0, y: 0 };
let hoverActivated = false;
let eventosAsignados = false;

function asignarEventosHover() {
	 if (eventosAsignados) {
        console.log("Eventos de hover ya asignados. No se duplicarán.");
        return;
    }
    eventosAsignados = true;

    asignadoHover = true;
    var layout = updatePlotSize(0);
    let plotDiv = document.getElementById('plotDiv');

    if (!plotDiv) {
        console.error("plotDiv no encontrado.");
        return;
    }

    console.log("Asignando eventos de hover...");

    plotDiv.on('plotly_hover', function(event) {
        lastMousePos = { x: event.event.pageX, y: event.event.pageY };

        clearTimeout(hoverTimeout);
        
        hoverTimeout = setTimeout(() => {
            if (lastMousePos.x === event.event.pageX && lastMousePos.y === event.event.pageY) {
                // Acceder al customdata de la primera serie (o la serie correcta)
                let hoveredGen = event.points[0].customdata[0];  // Obtener el primer valor de customdata (generation)

                if (hoveredGen === -1 || hoveredGen === -5) { 

                    let sizes = [...defaultSizes];
                    let opacities = new Array(sizes.length).fill(0.3); // Todos opacos por defecto

                    // Obtener los datos actuales de la gráfica
                    let graphData = document.getElementById("plotDiv").data;
					
					
                    if (graphData && graphData.length > 0) {
                        let customdata = graphData[0].customdata; // Acceder al customdata

                        if (customdata) {
                            // Buscar el índice de la generación en customdata
                            let index = customdata.findIndex(gen => gen[0] === hoveredGen);
                            
                            if (index !== -1) {
                                sizes[index]*= 1.5;  // Agrandar solo ese punto
                                opacities[index] = 1.0; // Hacerlo completamente visible
                            }
						
                            // Actualizar el gráfico con los nuevos tamaños y opacidades
                            Plotly.restyle("plotDiv", { 
                                'marker.size': [sizes], 
                                'marker.opacity': [opacities] 
                            }, layout, [0]);
                        }
                    }
                }
                else {

                    // Obtener las generaciones actuales desde el gráfico
                    let graphData = document.getElementById("plotDiv").data;
                    
                    if (graphData && graphData.length > 0) {
                        let currentGenerations = graphData[0].customdata || []; // Extraer customdata (incluye manuales)

                        let scaleFactor = 2; // Factor de escalado, ajusta según necesites

						let newSizes = currentGenerations.map((gen, i) =>
							gen[0] === hoveredGen ? defaultSizes[i] * scaleFactor : defaultSizes[i]
						);

                        let newOpacities = currentGenerations.map(gen => gen[0] === hoveredGen ? 1.0 : 0.3);

                        Plotly.restyle(plotDiv, { 'marker.size': [newSizes], 'marker.opacity': [newOpacities] }, layout, [0]);
                    }
                }
                hoverActivated = true;
            }
        }, 2000);
    });

    plotDiv.on('mousemove', function(event) {
        if (hoverActivated) {
            if (Math.abs(lastMousePos.x - event.pageX) > 5 || Math.abs(lastMousePos.y - event.pageY) > 5) {
                clearTimeout(hoverTimeout);
                hoverActivated = false;
                Plotly.restyle(plotDiv, { 'marker.size': [defaultSizes] }, layout, [0]);
            }
        }
    });

    plotDiv.on('plotly_unhover', function(event) {
        clearTimeout(hoverTimeout);
        hoverActivated = false;

        hoverTimeout = setTimeout(() => {
            console.log('2 segundos de unhover completados');
            Plotly.restyle(plotDiv, { 'marker.size': [defaultSizes], 'marker.opacity': [1.0] }, layout, [0]);
        }, 2000);
    });
}



  // Evento para actualizar al mover el slider
    slider.addEventListener('input', function() {
      valor = parseInt(this.value);
	  if(modo2)
	  {
	  actualizarG2(valor);
	  console.log('MODO 2');
	  }
	  else{
      actualizarGrafica(valor);
	  
	  }
      ultimoValorValido = valor; // Guardar el valor actual como válido
	
	  
	  playButton.textContent = 'Play';
	  animationPaused =true;
	  clearTimeout(animationTimeout); 
	  
    });

var valor;
	
	 // Evento para actualizar al escribir en el input numérico
    numeroPuntos.addEventListener('input', function() {
		playButton.textContent = 'Play';
	  animationPaused =true;
	  clearTimeout(animationTimeout); 
       valor = this.value;
      if (valor === '') {
        // Permitir borrar para escribir un nuevo valor
        return;
      }
      const valorNumerico = parseInt(valor);
      if (!isNaN(valorNumerico) && valorNumerico >= firstPositive && valorNumerico <= howManyGenerations) {
			if(modo2)
		  {
		  actualizarG2(valorNumerico);
		  }
		  else{
		  actualizarGrafica(valorNumerico);
		  }
        ultimoValorValido = valorNumerico;
      }

    });
	
	 numeroPuntos.addEventListener('blur', function() {
       valor = this.value;
      if (valor === '' || isNaN(parseInt(valor)) || parseInt(valor) < firstPositive || parseInt(valor) > howManyGenerations) {
        // Restaurar el último valor válido si el actual es inválido
		if(valor < firstPositive){
		this.value=firstPositive;
			if(modo2)
		  {
		  actualizarG2(firstPositive);
		  }
		  else{
		  actualizarGrafica(firstPositive);
		  }
		}
		else{
        this.value = ultimoValorValido;
		}
      }
    });

// Asignar simbolos diferentes a cada generacion 
function getSymbolForGeneration(generation) {
  if (generation === -1){
	return 'x';
  }
  else if(generation === -2 ) {
    return 'triangle-up';  
 }else if(generation===-3){
	return 'triangle-down';  
	}  
  else if (generation === -5) {
    return 'star';         
  } else {
    return 'circle';       // Por defecto, símbolo de círculo
  }
}

//button3.textContent = "Habilitar efecto Hover";
function removeHoverEvents() {
    let plotDiv = document.getElementById('plotDiv');

    if (plotDiv) {
		eventosAsignados=false;
        if (plotDiv.data) { // Verifica si los datos ya están cargados
            asignadoHover = false;
            plotDiv.removeAllListeners('plotly_hover');
            plotDiv.removeAllListeners('mousemove');
            plotDiv.removeAllListeners('plotly_unhover');
        } else {
            // Observar cambios en el DOM hasta que la gráfica se cargue
            let observer = new MutationObserver((mutationsList, observer) => {
                if (plotDiv.data && button3.textContent === "Habilitar efecto Hover") {
                    asignadoHover = false;
                    plotDiv.removeAllListeners('plotly_hover');
                    plotDiv.removeAllListeners('mousemove');
                    plotDiv.removeAllListeners('plotly_unhover');
                    observer.disconnect(); // Detiene la observación
                }
            });

            observer.observe(plotDiv, { childList: true, subtree: true });
        }
    }
}

function getPositionInGeneration(targetID) {
    // Crear un mapa para agrupar IDs por generación
    let generationMap = new Map();

    // Recorrer los datos y agrupar por generación
    parsedData.forEach(function(data) {
        var id = data[2]; // Obtener el ID
        var generation = data[1]; // Obtener la generación

        if (!generationMap.has(generation)) {
            generationMap.set(generation, []);
        }
        generationMap.get(generation).push(id);
    });

    // Buscar la generación del ID objetivo
    let targetGeneration = null;
    for (let data of parsedData) {
        if (data[2] === targetID) {
            targetGeneration = data[1]; // Encontramos la generación del ID
            break;
        }
    }

    if (targetGeneration === null) {
        return `ID ${targetID} no encontrado.`;
    }

    // Buscar la posición del ID dentro de su generación
    let generationArray = generationMap.get(targetGeneration);
    let position = generationArray.indexOf(targetID) + 1; // Se usa +1 para que sea base 1 (no base 0)

    return position;
}



 // Funcion para mostrar todos los puntos sin animacion 
function showAllPoints() {
	  rememberF(2);
	  var playButton = document.getElementById('playButton');
	  playButton.textContent = 'Play';
	  //tableBody.style.pointerEvents = 'none'; 
	  disableTable();
	  animationPaused =true;
	  showAllActive=true;
	  selectedRows.clear();
	  removedRows.length = 0;
	  manualSelectedGenerations.clear();
	  removedGenerations.clear();
	  clearTimeout(animationTimeout); 
	  habilitarBotonesMenu();
	  changeControl=false;
	  if(control)
	  {
		defaultSizes=GuardarDefaultsizes;
	  }
	  control=false;
	   let customdataAll = [];
      var xAll = [];
      var yAll = [];
      var textAll = [];
	  symbolAll=[];
	  selectedRows.clear(); // Limpia las selecciones previas
	  const rows = document.querySelectorAll("#legendDiv tr"); // Selecciona todas las filas dentro de la tabla
			
	 if(!modo2)
	 {
			rows.forEach(row => {
			const index = row.getAttribute("data-index"); 
			if (index !== null) {
				selectedRows.add(index); // Agrega el índice al conjunto de filas seleccionadas
				
				// Remueve la clase "selected" de todas las celdas previamente seleccionadas
				//document.querySelectorAll(".selected").forEach(cell => cell.classList.remove("selected"));

				// Aplica la clase SOLO a la primera celda de la fila
				const firstCell = row.querySelector("td:first-child");
				if (firstCell) {
					firstCell.classList.add("selected");
				}
			}
		});
	}
	else
	{
		rows.forEach(row => {
		const index = row.getAttribute("data-index"); 
		if (index !== null) {
			selectedRows.delete(index); // Remueve el índice del conjunto de filas seleccionadas
			
			// Remueve la clase "selected" de TODAS las celdas en la fila
			row.querySelectorAll("td").forEach(cell => cell.classList.remove("selected"));
		}
	});
	}


      // Recorrer cada conjunto de datos y acumular las coordenadas y textos
      parsedData.forEach(function(item, index) {
        var data = item[0]; // Obtenemos el arreglo de datos: [x, y]
        var generation = generations[index];
        var Value = Values[index];
		var trainCr=trainValues[index];
		var testCr=testValues[index];
		var sizeCr=sizeValues[index];
		var expreCr=expressions[index];
		var ID = IDs[index];
		var position=getPositionInGeneration(ID);

        // Asegurarse de que las coordenadas sean arrays
        var xData = Array.isArray(data[0]) ? data[0] : [data[0]];
        var yData = Array.isArray(data[1]) ? data[1] : [data[1]];

        // Concatenar los datos en los arrays generales
        xAll = xAll.concat(xData);
        yAll = yAll.concat(yData);

	 var texts = xData.map(function(x, i) {
            let text = "";

            // Lógica para definir el texto de acuerdo a `generation`
            switch (generation) {
                case -1:
                    text = "Target Value";
                    break;
                case -2:
                    text = "Initial Population";
                    break;
                case -3:
                    text = "Random Trees";
                    break;
                case -5:
                    text = "Best Individual";
                    break;
                default:
                    text = `Generation: ${generation}`;
            }

            let extraInfo = "";
			
			if(generation!=-1){
				if (trainCr != null && trainCr !== "" && !isNaN(parseFloat(trainCr))) extraInfo += `<br>Training: ${parseFloat(trainCr).toFixed(4)}`;
				if (testCr != null && testCr !== "" && !isNaN(parseFloat(testCr))) extraInfo += `<br>Validation: ${parseFloat(testCr).toFixed(4)}`;
				if (sizeCr != null && sizeCr !== "" && !isNaN(parseFloat(sizeCr))) {
					extraInfo += Number.isInteger(sizeCr) ? `<br>Size: ${sizeCr}` : `<br>Size: ${parseFloat(sizeCr).toFixed(4)}`;
				}
				if(showSymbolic){
				if (expreCr !== "" && expreCr!=null) extraInfo += `<br>Expression: ${expreCr}`;
				}
			}

            return text + extraInfo;
        });

        textAll = textAll.concat(texts);
					
		 // Usar la función para obtener el símbolo para este grupo
		var symbolForGroup = getSymbolForGeneration(generation);
		  // Asignar ese símbolo a cada punto de xData
		var symbols = xData.map(function() {
			return symbolForGroup;
			});
		symbolAll = symbolAll.concat(symbols);
				 let customDataValues = xData.map(function(_, i) {
			return [generation, IDs[index]]; // Usar el ID real de la variable IDs
		});
		//console.log(customDataValues);
		customdataAll = customdataAll.concat(customDataValues);
	
		
		});
	if(!cambioEscala){
		defaultSizes = new Array(xAll.length+3).fill(8); // Tamaño inicial de los puntos
	}
	
		trace = {
		  x: xAll, // Asegúrate de que xAll es un array con los datos del eje x
		  y: yAll, // Asegúrate de que yAll es un array con los datos del eje y
		  text: textAll, // Opcional: array con textos para cada punto
		  hoverinfo: 'text', 
		  mode: 'markers', // 'markers' para puntos, 'lines' para líneas, 'lines+markers' para ambos
		  type: 'scatter', // Tipo de gráfico, 'scatter' es común para gráficos de dispersión
		  marker: {
                        size: defaultSizes,
                        color: colors, // assignacion de colores
						symbol: symbolAll,
						line: { width: 0 },
						opacity: 1.0 
                    },
          name: '2D Projections of Semantic Space',
		  showlegend:false,
          size: 16,
		  customdata:customdataAll
		  
		};
	  layoutUpdate=updatePlotSize(0);
	  if(firstClick){
		firstClick=false;	
		
	  }
	  else{
		 Plotly.update('plotDiv', {
			x: [xAll],
			y: [yAll],
			text: [textAll]
		  },layoutUpdate);
	  }
	  modo='B';
	  
	  if(asignadoHover){
	  removeHoverEvents(); // Elimina los eventos previos
	  }
	 if(!removedHover){
	 asignarEventosHover(); 
	 }
	 
	 if(lastValuesLoaded)
	{
		plotLastElements();
		document.getElementById("loadLastValuesButton").classList.add("selected-button");
	}
	
	convergenceButton.disabled = !ValidarConvergence();
 }
 
  var eventoExtra=false;

function infoExtra() {
	if (eventoExtra) return;
	eventoExtra = true;
	/*
	plotDiv.on('plotly_hover', function(data) {
		const point = data.points[0];
		const id = point.customdata[1];

		const expression = expressions[id];
		if (expression) {
			// Posicionar tooltip
			tooltip.style.left = `${data.event.clientX + 10}px`;
			tooltip.style.top = `${data.event.clientY + 10}px`;
			tooltip.style.display = 'block';

			// Renderizar sin delimitadores y sin lanzar error
			katex.render(expression, tooltip, {
				throwOnError: false
			});
		}
	});
	

	plotDiv.on('plotly_unhover', function() {
		tooltip.style.display = 'none';
	});
	*/
	
	 document.getElementById('plotDiv').on('plotly_click', function(data) {
        var point = data.points[0];
        var pointID = point.customdata[1];
		const expression = expressions[pointID];
		if (expression !== ""){
			console.log("Clic en: ", pointID);

			// Encontrar la generación correspondiente al pointID
			var index = IDs.indexOf(pointID); // Buscar el índice en IDs
			var pointGen = (index !== -1) ? generations[index] : "Desconocido"; // Obtener la generación
			
			
			popupContenido.innerHTML = ""; // cambio aquí

			const latexContainer = document.createElement('div'); // <-- no uses <p>

			// Renderiza la expresión con KaTeX
			katex.render(expression, latexContainer, {
				throwOnError: false,
				displayMode: true 
			});
			popupContenido.appendChild(latexContainer);
		}
		else{
			popupContenido.innerHTML = "No information";
		}
		
		// Agrega el elemento al popup
		
		popup2.classList.add('mostrar');
		
        
    });
}

botonCerrar2.addEventListener('click', function() {
                popup2.classList.remove('mostrar');
            });

function infoExtra2() {
	var hoveredCustomData;
    document.getElementById('plotDiv2').on('plotly_click', function(eventData) {
		// Filtrar los puntos que corresponden a los marcadores, no a las líneas
			if (eventData.points && eventData.points.length > 0) {
				eventData.points.forEach((point, index) => {
					// Verificar si el punto es un marcador (mode: 'markers')
					if (point.data.mode === 'markers') {
						// Acceder al customdata del punto del marcador
						hoveredCustomData = point.customdata;
						
						if (hoveredCustomData !== undefined) {
							console.log(`CustomData del punto ${index}: ${hoveredCustomData}`);
						} else {
							console.log(`CustomData del punto ${index} es undefined.`);
						}
					}
				});
			} else {
				console.log("No hay puntos en eventData.");
			}
        console.log("Clic en: ", hoveredCustomData);
		// Encontrar la generación correspondiente al pointID
		var index = IDs.indexOf(hoveredCustomData); // Buscar el índice en IDs
		var pointGen = (index !== -1) ? generations[index] : "Desconocido"; // Obtener la generación

        // Cambiar el título del modal
        document.querySelector("#modal h2").textContent = `📊 Point ${hoveredCustomData}, Generation ${pointGen}`;

        updateTable(hoveredCustomData);
        openModal();
    });
}

function updateTable(pointID) {
    var tbody = document.getElementById("modal-table-body");
    tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

    parsedData.forEach(function(data) {
        var id = data[2];
        if (id === pointID) {
            var train = data[4];
            var test = data[6];
            var expression = data[10];

            var row = tbody.insertRow();
            row.insertCell(0).textContent = train;
            row.insertCell(1).textContent = test;

            var expressionCell = row.insertCell(2);
            expressionCell.classList.add("truncate-text");

            // Verificar si la expresión está vacía o es NaN
            if (expression === "" || expression === "NaN") {
                expressionCell.textContent = expression === "" ? "Sin expresión" : "NaN";
            } else {
                // Insertar la expresión con los delimitadores LaTeX
                expressionCell.innerHTML = `\\(${expression}\\)`; // Poner la expresión dentro de delimitadores \( ... \)

                // Renderizar con KaTeX
                renderMathInElement(expressionCell, {
                    delimiters: [
                        { left: "\\(", right: "\\)", display: false }, // para expresiones en línea
                        { left: "\\[", right: "\\]", display: true } // para expresiones de bloque (si se usan)
                    ]
                });

                // Agregar un evento de clic para abrir el modal cuando se haga clic en la celda de la expresión
                expressionCell.addEventListener("click", function() {
                    showMathModal(expression);
                });
            }
        }
    });

    // Comprobación de si hay datos o si todo es NaN
    var hasData = tbody.querySelectorAll("tr").length > 0;
    var isAllNaN = Array.from(tbody.querySelectorAll("tr")).every(row => {
        return Array.from(row.cells).every(cell => cell.textContent.trim() === "NaN" || cell.textContent.trim() === "");
    });

    if (!hasData) {
        var messageRow = document.createElement("tr");
        var messageCell = document.createElement("td");
        messageCell.setAttribute("colspan", "3");
        messageCell.classList.add("text-center", "text-gray-500");
        messageCell.textContent = "No hay información disponible";
        messageRow.appendChild(messageCell);
        tbody.appendChild(messageRow);
    } else if (isAllNaN) {
        var messageRow = document.createElement("tr");
        var messageCell = document.createElement("td");
        messageCell.setAttribute("colspan", "3");
        messageCell.classList.add("text-center", "text-red-500");
        messageCell.textContent = "Información no válida recibida";
        messageRow.appendChild(messageCell);
        tbody.appendChild(messageRow);
    }
}

function adjustFontSize(text) {
            const baseSize = 30;  // Tamaño base de la fuente en px
            const maxSize = 60;   // Tamaño máximo de la fuente en px
            const minSize = 12;   // Tamaño mínimo de la fuente en px
            const textLength = text.length;
            let size = baseSize;

            // Ajustar el tamaño de la fuente según la longitud del texto
            if (textLength < 100) {
                size = baseSize;
            } else if (textLength < 200) {
                size = baseSize - 5;
            } else if (textLength < 300) {
                size = baseSize - 10;
            } else {
                size = baseSize - 15;
            }

            // Asegurarse de que el tamaño de la fuente no sea demasiado pequeño o grande
            size = Math.max(minSize, Math.min(size, maxSize));

            return size + 'px';
        }


function showMathModal(expression) {
    const fontSize = adjustFontSize(expression);
    const contentDiv = document.getElementById("math-content");

    // Renderizar la expresión con KaTeX
    contentDiv.innerHTML = katex.renderToString(expression);
    contentDiv.style.fontSize = fontSize;  // Ajuste de tamaño de la fuente

    // Verificar la longitud del contenido para añadir scroll si es necesario
    if (expression.length > 100) {
        contentDiv.classList.add('scrollable');
    } else {
        contentDiv.classList.remove('scrollable');
    }

    // Mostrar el modal
    document.getElementById("math-modal-overlay").classList.remove('hidden');
    document.getElementById("math-modal").classList.add('modal-show');
}

function closeMathModal() {
            document.getElementById("math-modal-overlay").classList.add('hidden');
            document.getElementById("math-modal").classList.remove('modal-show');
        }


 function openModal() {
            
			document.getElementById("modal-overlay").classList.remove('hidden');
            document.getElementById("modal").classList.add('modal-show');
}

function closeModal() {
            document.getElementById("modal-overlay").classList.add('hidden');
            document.getElementById("modal").classList.remove('modal-show');
    }
	

	var aux=false;
	var lastTraceExist=false;
	var void2=false;
// Cambio play/pause
function togglePlay() {
	rememberF(1);
	firstClick=false;
	modo='A';
	
	playButton.classList.add("selected-button");
	
	button3.disabled = true;
	loadLastValuesButton.disabled=false;
	console.log(defaultSizes);
	//tableBody.style.pointerEvents = 'none'; 
	disableTable();
	button4.disabled=true;
	if(!modo2) 
	{
		button1.disabled=false;
	}
	
    submenuEscala.style.display = "none";
	const rows = document.querySelectorAll("#legendDiv tr"); // Selecciona todas las filas dentro de la tabla
		rows.forEach(row => {
		const index = row.getAttribute("data-index"); 
		if (index !== null) {
			selectedRows.delete(index); // Remueve el índice del conjunto de filas seleccionadas
			
			// Remueve la clase "selected" de TODAS las celdas en la fila
			row.querySelectorAll("td").forEach(cell => cell.classList.remove("selected"));
		}
	});

    //toggleSelection(event.target);}
    if (playButton.textContent === 'Play') {
        if (plotInitialized) {
            if (animationPaused) {
			
				if(showAllActive || (!modo2 && aux)){
				showAllActive=false;
				removeHoverEvents();
				aux=false;
				
				symbolAll=[];
				animationPaused=false;
				currentIndex = 0;
                plotMarkersProgressively();
				}
				else{
					// If animation was paused, resume from the current frame
					if(modo2 && control && changeControl)
					{
				
					removeHoverEvents();
					removedHover=true;
					actualizarG2(valor);
					removedHover=false;
					modo='A';
					button1.disabled=true;
					button3.disabled = true;
					button4.disabled = true;
					button5.disabled=true;
					submenu.classList.remove("show");
					}
					 
					showAllActive=false;
					control=false;
					animationPaused = false;
					nextFrame();
				}
            } else {
                // If animation was not paused, start from the beginning
                currentIndex = 0;
                plotMarkersProgressively();
				
				
            }
        }
        playButton.textContent = 'Pause';
    } else {
        playButton.textContent = 'Play';
        clearTimeout(animationTimeout); // Clear the timeout to pause the animation
        animationPaused = true;
		if (modo2 && changeControl) {
			button1.disabled = true;
			button3.disabled = true;
			button4.disabled = true;
			button5.disabled = true;
		}
    }


	if(lastValuesLoaded && !modo2)
	{
		plotLastElements();
		document.getElementById("loadLastValuesButton").classList.add("selected-button");
	}
	
	if(lastValuesLoaded && modo2)
	{
		plotLastElements();
		document.getElementById("loadLastValuesButton").classList.add("selected-button");
	}
	

		convergenceButton.disabled = !ValidarConvergence();
}

var lastValuesLoaded = false;
var lastTraceId = [0]; // Store the trace ID for the last values trace
var changeControl=false;
var changeControl2=false;

function toggleLastElements() {
    if (!lastValuesLoaded) {
        plotLastElements(); // Plot the last elements when the button is clicked
        lastValuesLoaded = true;
        loadLastValuesButton.textContent = 'Evolution of Best Solution'; // Update button text
		document.getElementById("loadLastValuesButton").classList.add("selected-button");

    } else {
        removeLastElements(); // Remove the last elements trace
        lastValuesLoaded = false;
        loadLastValuesButton.textContent = 'Evolution of Best Solution'; // Reset button text
		document.getElementById("loadLastValuesButton").classList.remove("selected-button");
    }
}






var xLast = []; // Define xLast outside plotMarkersProgressively function
var yLast = []; // Define yLast outside plotMarkersProgressively function


            // Cargar markers progressivamente
function plotMarkersProgressively() {
	if(cambioEscala)
	{
	defaultSizes=GuardarDefaultsizes;
	}
	console.log(defaultSizes);
                trace = {
                    x: [],
                    y: [],
                    type: 'scatter',
                    mode: 'markers',
                    marker: {
                        size: defaultSizes,
						line: { width: 0 },
                        color: colors // assignacion de colores
                    },
                    name: '2D Projections of Semantic Space',
                    size: 16,
                    text: [],
					showlegend:false,
                    hoverinfo: 'text' // Show hover information from text
                };
				
	layoutUpdate=updatePlotSize(1);
          
                // Plot the main data
                Plotly.newPlot('plotDiv', [trace],layoutUpdate).then(function() {
					if (!showAllActive) {
						nextFrame(); // Inicia la animación solo si animationEnabled es true
					}
                updatePlotSize(1);
                   // plotLastElements(); // Plot the last element of each generation

                });
	
    }

var symbolAll=[];
// Siguiente frame de animacion
function nextFrame() { // Deshabilita hover mode completamente
    if (currentIndex < parsedData.length && !animationPaused) {
        var data = parsedData[currentIndex][0];
        var generation = generations[currentIndex];
        var Value = Values[currentIndex];
		var trainCr=trainValues[currentIndex];
		var testCr=testValues[currentIndex];
		var sizeCr=sizeValues[currentIndex];
        var expreCr = expressions[currentIndex];

        // Ensure x and y data are arrays
        var xData = Array.isArray(data[0]) ? data[0] : [data[0]];
        var yData = Array.isArray(data[1]) ? data[1] : [data[1]];
		var symbolForGroup = getSymbolForGeneration(generation);
		let text = "";
		switch (generation) {
			case -1:
				text = "Target Value";
				break;
			case -2:
				text = "Initial Population";
				break;
			case -3:
				text = "Random Trees";
				break;
			case -5:
				text = "Best Individual";
				break;
			default:
				text = `Generation: ${generation}`;
		}

		let extraInfo = "";
			 // Limitar a 4 decimales y mostrar si el valor no es NaN
		if(generation!=-1){
				if (trainCr != null && trainCr !== "" && !isNaN(parseFloat(trainCr))) extraInfo += `<br>Training: ${parseFloat(trainCr).toFixed(4)}`;
				if (testCr != null && testCr !== "" && !isNaN(parseFloat(testCr))) extraInfo += `<br>Validation: ${parseFloat(testCr).toFixed(4)}`;
				if (sizeCr != null && sizeCr !== "" && !isNaN(parseFloat(sizeCr))) {
					extraInfo += Number.isInteger(sizeCr) ? `<br>Size: ${sizeCr}` : `<br>Size: ${parseFloat(sizeCr).toFixed(4)}`;
				}
				if(showSymbolic){
				if (expreCr !== "" && expreCr!=null) extraInfo += `<br>Expression: ${expreCr}`;
				}
			}

		var texts = [xData.map(() => text + extraInfo)]; // Asegura que cada punto tenga su texto

		Plotly.extendTraces('plotDiv', {
			x: [xData],
			y: [yData],
			text: texts
		}, [0]);

		symbols = xData.map(function() {
			  return symbolForGroup;
			});
		symbolAll = symbolAll.concat(symbols);
		Plotly.restyle('plotDiv', {'marker.symbol': [symbolAll],'marker.color': [colors]}, [0]);
		
        currentIndex++;
        animationTimeout = setTimeout(nextFrame, 1); // tiempo entre frames
    }
}

let traceE=[];
function plotLastElements() {
    var lastGenerationData = {};
    var dataLength = parsedData.length;
    var maxGeneration = 0;
	var nextGen=howManyGenerations+(secondPositive-firstPositive);

	 // Recorrer cada conjunto de datos y acumular las coordenadas y textos
	let x2 = [];
	let y2 = [];
	let num=[];
	var i=0;

	for (let index = 0; index < parsedData.length; index++) {
	let data = parsedData[index];
	let dataValues2 = data[1]; // <- el segundo elemento
	let generation2= data[3];
	if (
		!dataValues2 ||                          // undefined o null
		dataValues2.length !== 2 ||              // no tiene dos elementos
		isNaN(dataValues2[0]) || isNaN(dataValues2[1]) // alguno de los dos es NaN
	) {
		break; // Se sale del ciclo si no cumple los requisitos
	}
	i++;
	x2.push(dataValues2[0]);
	y2.push(dataValues2[1]);
	num.push("Generation: "+generation2);
	}



	   // Obtener el índice del próximo trace antes de agregarlo
	Plotly.relayout('plotDiv', {}).then(function () {
		var plotDiv = document.getElementById('plotDiv');
		var currentTraces = plotDiv.data.length; // Número de trazas actuales

		//console.log("Número de trazas antes de agregar:", currentTraces);
		
		if (plotDiv.data.length > 1 && plotDiv.data[1]) {
			console.log("El trazo en el índice 1 ya existe. No se añadirá otro.");
			return; // Evita agregarlo nuevamente
		}
		
		traceE={
			x: x2,
			y: y2,
			mode: 'markers+lines',
			marker: {
				size: 10,
				symbol: 'x',
				color: 'black',
				line: { width: 0 },
				opacity: 1.0
			},
			text: num,
			hoverinfo: 'text',
			name: 'Evolution of Best Solution',
			showlegend:false
		};

		Plotly.addTraces('plotDiv', [{
			x: x2,
			y: y2,
			mode: 'markers+lines',
			marker: {
				size: 10,
				symbol: 'x',
				color: 'black',
				line: { width: 0 },
				opacity: 1.0
			},
			text: num,
			hoverinfo: 'text',
			name: 'Evolution of Best Solution',
			showlegend:false
		}], 1) // <- Agregar siempre en el índice 1
		.then(function () {
			lastTraceId = 1; // Asegurar que el índice 1 es el último agregado
		});
	});

	
	lastTraceExist=true;
}


function removeLastElements() {
    if (lastTraceId !== null) {
        Plotly.deleteTraces('plotDiv', [lastTraceId]);
        lastTraceId = null; // Reset trace ID after removal
		lastTraceExist=false;
    }
}
// Generar colores basados en las generaciones, considerando grupos de 5
function generateColors(generations) {
	console.log(currentColorMap);
	const colorMaps = {
        viridis: ["#440154", "#482878", "#3E4A89", "#31688E", "#26828E", "#1F9E89", "#35B779", "#6DCD59", "#B4DE2C", "#FDE725"],
        plasma: ["#0D0887", "#4B03A1", "#7D03A8", "#A522A7", "#CB4679", "#E06451", "#F1843D", "#FCA636", "#F6D746", "#F0F921"],
        magma: ["#000004", "#1B0C41", "#4A0C6B", "#781C6D", "#A52C60", "#CF4446", "#ED6925", "#FB9902", "#F9D225", "#FCFFA4"],
        cividis: ["#00224E", "#173B6E", "#32528E", "#4F699D", "#6C809E", "#89979D", "#A5AE9A", "#C0C692", "#DAD987", "#FDEE80"],
       "blue-red": [
	   
        "#0033CC", // Azul fuerte (frío)
        "#0066FF", // Azul brillante
        "#3399FF", // Azul claro
        "#66B2FF", // Azul muy claro
        "#99CCFF", // Azul pasteles
        "#FFB85C", // Naranja-amarillo (puro y vibrante)
        "#FF9F28", // Naranja cálido
        "#FF7518", // Naranja fuerte con toque amarillo
        "#FF4D00", // Rojo-anaranjado intenso
        "#FF1A1A", // Rojo brillante
        "#D60000" // Rojo oscuro (cálido extremo
    ],
	 "purple-pink": [
        "#E0BBFF", // Rosa suave
        "#D49EFF", // Rosa claro
        "#C183F0", // Morado claro
        "#A367D6", // Morado medio
        "#9A4FBF", // Morado suave
        "#D78CBB", // Rosa medio suave
        "#E09FB9", // Rosa suave
        "#F2A8D7", // Rosa intermedio
        "#F6A3D0", // Rosa más intenso
        "#FF8ACB", // Rosa brillante suave
        "#FF1F9E"  // Rosa brillante (final)
    ]};
	
    let colorArray = colorMaps[currentColorMap];
    let colors = [];
    
    if (generations.length === 0) return colors; // Manejo de caso vacío

    let maxGeneration = howManyGenerations;
    let totalBlocks = Math.max(1, Math.floor(maxGeneration / (secondPositive-firstPositive))); // Evitar división por cero
    let color;
    
    let hueStart = 55;  // Amarillo claro
    let hueEnd = 270;   // Azul-Morado
    let hueRange = hueEnd - hueStart;
    
	if (currentColorMap === 'spectrum') {
		generations.forEach(function(generation) {
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
				let blockIndex = Math.floor(generation / (secondPositive - firstPositive)); // Bloque actual
				let progress = blockIndex / totalBlocks; // Normalizar en [0,1]
				let Bloques = secondPositive - firstPositive; // Número total de bloques

				// Nueva fórmula: asegurar que el hue recorra TODO el rango
				let hue = hueStart + progress * hueRange;
				hue = hue % 360; // Mantener hue en el rango [0, 360]

				// Normalizar la posición dentro del bloque a un rango [0,1]
				let positionInBlock = (generation % Bloques) / Bloques;

				// Variación de la luminosidad en un rango fijo (por ejemplo, de 50% a 80%)
				let minLightness = 50;
				let maxLightness = 80;
				let lightness = minLightness + positionInBlock * (maxLightness - minLightness); 

				color = `hsl(${hue}, 100%, ${lightness}%)`;

					}

			colors.push(color);
		});
	} else {
		generations.forEach(function(generation) {
			// Si no es espectro, se usa uno de los otros mapas de color
			if (generation === -1) {
				color = "green";
			} else if (generation === -2) {
				color = "navy";
			} else if (generation === -3) {
				color = "purple";
			} else if (generation === -5 || generation === -210) {
				color="red";
				if(currentColorMap==="purple-pink" || currentColorMap==="magma")
				{
				color="blue";
				}
				else if(currentColorMap==="blue-red")
				{
				color="lime";
				}
			} else {
				let blockIndex = Math.floor(generation / (secondPositive-firstPositive));
				let colorIndex = Math.round((blockIndex / totalBlocks) * (colorArray.length - 1));
				color = colorArray[colorIndex];
			}
			
			colors.push(color);
		});
	}
    
	return colors;
}


function getColorForGeneration(generationError) {
    var legendTable = document.getElementById('legendDiv').getElementsByTagName('tr');

    for (var i = 0; i < legendTable.length; i++) {
        var row = legendTable[i];
        var genValue = parseFloat(row.getAttribute('data-index')); // Obtener el valor de data-index

        // Si generationError es 1, tomar el color de la generación 2
        if (generationError === -1) {
            return legendTable[2].cells[1].style.backgroundColor;
        }
        else if (genValue === generationError) {
            return row.cells[1].style.backgroundColor;
        }
    }
    return 'red'; // Color por defecto si no se encuentra
}


let traceC=[];
// Función para graficar la convergencia
function plotConvergence() {

   if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }

    if (plotInitializedC) {
        traceC = [];
    }

    // Filtrar los datos según la condición y eliminar NaN
    let validData = generations.map((gen, i) => ({
        x: gen,  // El eje X es generations
        y: trainValues[i],  // El eje Y es trainValues
        color: getColorForGeneration(gen),
        text: `Generation: ${gen}, Fitness: ${trainValues[i]}`,
        customdata: IDs[i] // Agregar el identificador único
    })).filter((point, i) => isBestValues[i] === 1 && generations[i] >= 0 && !isNaN(point.x) && !isNaN(point.y));

    if (validData.length === 0) {
        console.error("Error: No hay datos válidos después de eliminar NaN o que cumplan la condición.");
        return;
    }
		console.log("Custom Data: ", validData.map(p => p.customdata));  // Ver el contenido de customdata
	
	
    // Crear segmentos de línea con colores individuales
    for (let i = 0; i < validData.length - 1; i++) {
        traceC.push({
            x: [validData[i].x, validData[i + 1].x],  // Eje X: generations
            y: [validData[i].y, validData[i + 1].y],  // Eje Y: trainValues
            mode: 'lines',
            type: 'scattergl',
            line: { color: validData[i].color, width: 3 },
            hoverinfo: 'none',
            showlegend: false
        });
    }

	const customDataAll=validData.map(p => p.customdata);
    // Agregar los puntos con sus colores e identificadores
    traceC.push({
        x: validData.map(p => p.x),  // Eje X: generations
        y: validData.map(p => p.y),  // Eje Y: trainValues
        mode: 'markers',
        type: 'scattergl',
        marker: { color: validData.map(p => p.color), size: 8 },
        text: validData.map(p => p.text),
        hoverinfo: 'text',
        name: 'Puntos',
        showlegend: false,
        customdata: customDataAll // Agregar customdata con los IDs
    });
	
	console.log(customDataAll);


    if (!plotInitializedC) {
        var layoutC = {
            title: {
                text: '2D Projections of Semantic Space',
                font: {
                    weight: 'bold',
					 family: "Times New Roman, serif",
                    size: 36
                }
            },
            xaxis: {
                title: 'Component 1',
                titlefont: {
                    weight: 'bold',
					 family: "Times New Roman, serif",
                    size: 29
                }
            },
            yaxis: {
                title: 'Component 2',
                titlefont: {
                    weight: 'bold',
					 family: "Times New Roman, serif",
                    size: 29
                }
            },
            legend: {
                font: { size: 18 },
                x: 0.6,
                y: 0.01,
                xanchor: 'left',
                yanchor: 'top',
                orientation: 'v'
            }
        };
        Plotly.newPlot('plotDiv2', [layoutC]);
        animatePlot(0, traceC);
        plotInitializedC = true;
        document.getElementById("plotDiv2").style.border = "4px solid black";
    } else {
        Plotly.react('plotDiv2', traceC);
    }

    plotInitializedC = true;
    document.getElementById("plotDiv2").style.border = "4px solid black";

    updatePlotSize();
	AsignarEvento2();
	if(lastTraceExist)
	{
	plotLastElements();
	}
}

var eventosAsignados2=false;
function AsignarEvento2() {
	if (eventosAsignados2) {
			console.log("Eventos de hover ya asignados. No se duplicarán.");
			return;
	}
	eventosAsignados2 = true;
    var plotDiv2 = document.getElementById('plotDiv2');
	var layout=updatePlotSize(); 
	var hoveredCustomData;
    plotDiv2.on('plotly_hover', function(eventData) {
        // Mostrar el contenido completo de eventData para depuración
        console.log("eventData: ", eventData);

        // Filtrar los puntos que corresponden a los marcadores, no a las líneas
        if (eventData.points && eventData.points.length > 0) {
            eventData.points.forEach((point, index) => {
                // Verificar si el punto es un marcador (mode: 'markers')
                if (point.data.mode === 'markers') {
                    // Acceder al customdata del punto del marcador
                    hoveredCustomData = point.customdata;
                    
                    if (hoveredCustomData !== undefined) {
                        console.log(`CustomData del punto ${index}: ${hoveredCustomData}`);
                    } else {
                        console.log(`CustomData del punto ${index} es undefined.`);
                    }
                }
            });
        } else {
            console.log("No hay puntos en eventData.");
        }
		
		if(modo!='A')
		{
			let graphData = document.getElementById("plotDiv").data;

			if (graphData && graphData.length > 0) {
				let currentGenerations = graphData[0].customdata || []; // Extraer customdata (incluye manuales)
				
			 // Verificar si existe un punto con la identificación de hoveredCustomData
				let pointExists = currentGenerations.some(gen => gen[1] === hoveredCustomData);

				// Solo hacer el restyle si el punto existe
				if (pointExists) {
					// Crear nuevos tamaños y opacidades basados en si customdata[1] es hoveredCustomData
					 let scaleFactor = 2; // Factor de escalado, ajusta según necesites

						let newSizes = currentGenerations.map((gen, i) =>
							gen[1] === hoveredCustomData ? defaultSizes[i] * scaleFactor : defaultSizes[i]
						);
					let newOpacities = currentGenerations.map(gen => gen[1] === hoveredCustomData ? 1.0 : 0.2);

					Plotly.restyle(plotDiv, { 'marker.size': [newSizes], 'marker.opacity': [newOpacities] }, layout, [0]);
				}
			}
		}

		
    });
	
	 plotDiv2.on('plotly_unhover', function(event) {
        console.log('Unhover detectado');
		if(modo!='A')
		{
			console.log(defaultSizes);
            Plotly.restyle(plotDiv, { 'marker.size': [defaultSizes], 'marker.opacity': [1.0] }, layout, [0]);
			}
    });
}


var animationTimeout = null; // Variable global para controlar la animación

function animatePlot(index, traces) {
    if (index < traces.length) {
        Plotly.addTraces('plotDiv2', traces.slice(0, index + 1));

        animationTimeout = setTimeout(function () {
            animatePlot(index + 1, traces);
        }, 100);
    }
}

function createColorLegend(generations, colors) {
    var legendDiv = document.getElementById('legendDiv');
    
    // Limpiar el contenido del div antes de agregar la tabla
    legendDiv.innerHTML = '';

    var table = document.createElement('table');
    
    // Aplicamos clases de Tailwind para el estilo de la tabla
    table.classList.add('min-w-full', 'border-collapse', 'shadow-lg', 'rounded-lg', 'text-sm', 'border', 'border-black');
    
    var header = table.createTHead();
    var row = header.insertRow();
    
    // Estilo de los encabezados con fondo negro y texto blanco
    row.classList.add('bg-black', 'text-white', 'font-semibold');
    
    var cell = row.insertCell();
    cell.appendChild(document.createTextNode('Items'));
    cell.classList.add('px-4', 'py-2', 'border', 'border-black', 'text-center');

    cell = row.insertCell();
    cell.appendChild(document.createTextNode('Symbol'));
    cell.classList.add('px-4', 'py-2', 'border', 'border-black', 'text-center');

    cell = row.insertCell();
    cell.appendChild(document.createTextNode('Color'));
    cell.classList.add('px-4', 'py-2', 'border', 'border-black', 'text-center');

    var uniqueGenerations = [...new Set(generations)];

    for (var i = 0; i < uniqueGenerations.length; i++) {
        var generation = uniqueGenerations[i];
        var lastIndex = generations.lastIndexOf(generation);
        row = table.insertRow();
        
        // Mantengo la línea importante para agregar el índice a la fila
        row.setAttribute("data-index", generation);

        cell = row.insertCell();
        var generationLabel = '';
        if (generation === -1) {
            generationLabel = 'Target Value';
        } else if (generation === -2) {
            generationLabel = 'Initial Population';
        } else if (generation === -3) {
            generationLabel = 'Random Trees';
        } else if (generation === -5) {
            generationLabel = 'Best Individual';
        } else {
            generationLabel = 'Gen.'+generation;
        }
        cell.appendChild(document.createTextNode(generationLabel));
        cell.style.backgroundColor = 'white';
        cell.classList.add('px-4', 'py-2', 'border', 'border-black', 'text-center');
				
				cell = row.insertCell();
		cell.classList.add('px-4', 'py-2', 'border', 'border-black', 'text-center');
		cell.style.backgroundColor = 'white'; // fondo blanco en todos los casos para contraste

		// Añadir símbolo solo para generaciones especiales
		if (generation === -1 || generation === -2 || generation === -3 || generation === -5) {
			const symbolsByGeneration = {
				'-1': '🗙', // Target Value
				'-2': '▲', // Initial Population
				'-3': '▼', // Random Trees
				'-5': '★'  // Best Individual
			};

			const symbol = symbolsByGeneration[generation.toString()] || '';
			const symbolSpan = document.createElement('span');
			symbolSpan.innerText = symbol;
			symbolSpan.className = 'legend-symbol';
			symbolSpan.style.color = colors[lastIndex];
			symbolSpan.style.fontSize = '24px'; // tamaño grande del símbolo
			symbolSpan.style.display = 'inline-block';
			symbolSpan.style.width = '100%';
			symbolSpan.style.textAlign = 'center';

			cell.appendChild(symbolSpan);
		} else {
			// Para generaciones normales, solo se pinta el fondo
			cell.style.backgroundColor = colors[lastIndex];
		}

    }
    
    // Deshabilitamos los clics en las celdas
    var cells = table.querySelectorAll('td');
    cells.forEach(function(cell) {
        cell.style.pointerEvents = 'none'; // Desactiva los clics en las celdas
    });

    legendDiv.appendChild(table);
}


function disableTable(){
   // Deshabilitamos los clics en las celdas
    var cells = tableBody.querySelectorAll('td');
    cells.forEach(function(cell) {
        cell.style.pointerEvents = 'none'; // Desactiva los clics en las celdas
    });
}

function enableTable(){
   // Deshabilitamos los clics en las celdas
    var cells = tableBody.querySelectorAll('td');
    cells.forEach(function(cell) {
        cell.style.pointerEvents = 'auto'; // Desactiva los clics en las celdas
    });
}


    // Button event listener
            var selectFileButton = document.getElementById('selectFileButton');
            selectFileButton.addEventListener('click', promptForCSVFile);
            clearLegendTable();
            clearPlot();
            promptForCSVFile();
			
        });
