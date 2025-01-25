
// Seleccionar la tabla
const table = document.querySelector("#ctl00_mainCopy_dbgHorarios");
if (table) {
  // Agregar la columna para checkboxes en la última columna
  table.querySelectorAll("tr").forEach((row, index) => {
    const td = document.createElement(index === 0 ? "th" : "td");
    if (index === 0) {
      td.textContent = "Seleccionar";
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("row-selector");
      td.appendChild(checkbox);
    }
    row.appendChild(td); // Agregar la nueva columna al final
  });

  // Crear el contenedor de los filtros
  const filterContainer = document.createElement("div");
  filterContainer.style.marginBottom = "20px";
  filterContainer.style.display = "flex";
  filterContainer.style.gap = "10px"; // Espaciado entre elementos

  // Campo para filtrar por maestro
  const inputMaestro = document.createElement("input");
  inputMaestro.type = "text";
  inputMaestro.placeholder = "Filtrar por profesor";
  inputMaestro.style.flex = "1"; // Expandir para que sea más ancho

  // Campo para filtrar por materia
  const inputMateria = document.createElement("input");
  inputMateria.type = "text";
  inputMateria.placeholder = "Filtrar por asignatura";
  inputMateria.style.flex = "1"; // Expandir para que sea más ancho

  // Botón "Ver horario"
  const button = document.createElement("button");
  button.textContent = "Ver horario";
  button.style.backgroundColor = "#4caf50";
  button.style.color = "white";
  button.style.border = "none";
  button.style.padding = "10px 15px";
  button.style.cursor = "pointer";
  button.style.borderRadius = "5px";

  // Agregar los elementos al contenedor
  filterContainer.appendChild(inputMaestro);
  filterContainer.appendChild(inputMateria);
  filterContainer.appendChild(button);

  // Insertar el contenedor antes de la tabla
  table.parentElement.insertBefore(filterContainer, table);

  // Función de filtrado
  const filterRows = () => {
    const searchMaestro = inputMaestro.value.toLowerCase();
    const searchMateria = inputMateria.value.toLowerCase();

    table.querySelectorAll("tbody tr").forEach((row, index) => {
      if (index === 0) return; // Saltar la fila del encabezado
      const materiaCell = row.children[1]; // Celda de "Asignatura"
      const maestroCell = row.children[2]; // Celda de "Profesor"

      const matchesMaestro = !searchMaestro || maestroCell.textContent.toLowerCase().includes(searchMaestro);
      const matchesMateria = !searchMateria || materiaCell.textContent.toLowerCase().includes(searchMateria);

      row.style.display = matchesMaestro && matchesMateria ? "" : "none"; // Mostrar u ocultar
    });
  };

  // Escuchar eventos de entrada en los filtros
  inputMaestro.addEventListener("input", filterRows);
  inputMateria.addEventListener("input", filterRows);

  // Crear el modal
  const modal = document.createElement("div");
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.zIndex = "10000";
  modal.style.padding = "20px";
  modal.style.background = "white";
  modal.style.border = "1px solid #ddd";
  modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.15)";
  modal.style.maxHeight = "80vh";
  modal.style.overflowY = "auto";
  modal.style.borderRadius = "8px";
  modal.style.fontFamily = "'Arial', sans-serif";
  document.body.appendChild(modal);

  const closeButton = document.createElement("button");
  closeButton.textContent = "Cerrar";
  closeButton.style.marginTop = "10px";
  closeButton.style.padding = "8px 12px";
  closeButton.style.backgroundColor = "#f44336";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.onclick = () => (modal.style.display = "none");
  modal.appendChild(closeButton);

  const modalContent = document.createElement("div");
  modal.appendChild(modalContent);

  // Función para eliminar una fila del modal y actualizar las advertencias
  const removeRowFromModal = (row) => {
    // Deseleccionar la fila en la tabla principal
    const grupo = row.querySelector("td:nth-child(1)").textContent.trim(); // Obtener el grupo
    const checkboxes = table.querySelectorAll("tr");

    checkboxes.forEach((checkboxRow) => {
      const rowGroup = checkboxRow.querySelector("td:nth-child(1)")?.textContent.trim();
      if (rowGroup === grupo) {
        const checkbox = checkboxRow.querySelector("input[type='checkbox']");
        if (checkbox) {
          checkbox.checked = false; // Desmarcar el checkbox en la tabla principal
        }
      }
    });

    // Eliminar la fila del modal
    row.remove();

    // Re-evaluar las advertencias
    evaluateWarnings();
  };

  // Función para evaluar las advertencias
  const evaluateWarnings = () => {
    const rows = modalContent.querySelectorAll("tbody tr");
    const warnings = [];
    const horarios = {};
    const materias = {};

    rows.forEach((row) => {
      const [grupo, materia, maestro, edificio, salon, lun, mar, mie, jue, vie, sab] = Array.from(row.children).map(
        (cell) => cell.textContent.trim()
      );

      // Detectar duplicados de materia
      if (materias[materia]) {
        warnings.push(`⚠️ La materia "${materia}" está seleccionada más de una vez.`);
      } else {
        materias[materia] = true;
      }

      // Detectar conflictos de horarios
      ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].forEach((dia, i) => {
        const horario = [lun, mar, mie, jue, vie, sab][i];
        if (horario) {
          if (!horarios[dia]) horarios[dia] = [];
          horarios[dia].forEach((h) => {
            if (h === horario) {
              warnings.push(`⚠️ Conflicto: Horario "${horario}" en ${dia} para la materia "${materia}".`);
            }
          });
          horarios[dia].push(horario);
        }
      });
    });

    // Mostrar advertencias
    const warningList = modalContent.querySelector("ul");
    if (warnings.length > 0) {
      if (!warningList) {
        const newWarningList = document.createElement("ul");
        newWarningList.style.color = "red";
        warnings.forEach((warning) => {
          const li = document.createElement("li");
          li.textContent = warning;
          newWarningList.appendChild(li);
        });
        modalContent.prepend(newWarningList);
      } else {
        warningList.innerHTML = '';
        warnings.forEach((warning) => {
          const li = document.createElement("li");
          li.textContent = warning;
          warningList.appendChild(li);
        });
      }
    } else {
      if (warningList) {
        warningList.innerHTML = ''; // Limpiar advertencias si no hay inconsistencias
      }
    }
  };

  // Función para descargar el HTML del modal
  const downloadHTML = () => {
    const modalHTML = modalContent.innerHTML;
    const blob = new Blob([modalHTML], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "horarios_modal.html";
    link.click();
  };

  // Lógica para el botón "Ver horario"
  button.addEventListener("click", (event) => {
    event.preventDefault(); // Prevenir redirección
    modalContent.innerHTML = ""; // Limpiar contenido previo

    const selectedRows = [];
    const horarios = {}; // Para detectar conflictos
    const materias = {}; // Para detectar duplicados
    let warnings = []; // Lista de advertencias

    // Crear tabla dentro del modal
    const modalTable = document.createElement("table");
    modalTable.style.width = "100%";
    modalTable.style.borderCollapse = "collapse";
    modalTable.style.marginTop = "10px";

    const modalTableHead = document.createElement("thead");
    const modalTableRow = document.createElement("tr");

    // Crear encabezados
    ["Grupo", "Asignatura", "Profesor", "Edificio", "Salón", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Acciones"].forEach(
      (header) => {
        const th = document.createElement("th");
        th.textContent = header;
        th.style.border = "1px solid #ddd";
        th.style.padding = "10px 15px";
        th.style.backgroundColor = "#800000";  // Color de fondo para los titulares
        th.style.color = "white"; // Mejor contraste
        modalTableRow.appendChild(th);
      }
    );

    modalTableHead.appendChild(modalTableRow);
    modalTable.appendChild(modalTableHead);

    const modalTableBody = document.createElement("tbody");

    table.querySelectorAll(".row-selector:checked").forEach((checkbox) => {
      const row = checkbox.closest("tr");
      const [grupo, materia, maestro, edificio, salon, lun, mar, mie, jue, vie, sab] = Array.from(
        row.children
      ).map((cell) => {
        if (cell.querySelector('select')) return ''; // Ignorar select
        return cell.textContent.trim();
      });

      const newRow = document.createElement("tr");

      // Asignar los valores correctamente a cada columna
      [grupo, materia, maestro, edificio, salon, lun, mar, mie, jue, vie, sab].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        td.style.border = "1px solid #ddd";
        td.style.padding = "8px";
        newRow.appendChild(td);
      });

      // Agregar botón "Quitar"
      const removeButton = document.createElement("button");
      removeButton.textContent = "Quitar";
      removeButton.onclick = () => {
        newRow.remove(); // Eliminar fila del modal
        removeRowFromModal(newRow); // Desmarcar el checkbox en la tabla principal
      };
      
      const actionsCell = document.createElement("td");
      actionsCell.style.border = "1px solid #ddd";
      actionsCell.style.padding = "8px";
      actionsCell.appendChild(removeButton);
      newRow.appendChild(actionsCell);

      modalTableBody.appendChild(newRow);
    });

    modalTable.appendChild(modalTableBody);
    modalContent.appendChild(modalTable);

    // Evaluar advertencias
    evaluateWarnings();

    // Crear botón de descarga dentro del modal
 
const downloadButton = document.createElement("button");
downloadButton.textContent = "Descargar HTML";
downloadButton.style.marginTop = "10px";
downloadButton.style.backgroundColor = "#008CBA";
downloadButton.style.color = "white";
downloadButton.style.padding = "10px 15px";
downloadButton.style.border = "none";
downloadButton.style.borderRadius = "5px";
downloadButton.style.cursor = "pointer"; // Añadido para mejorar la interacción
downloadButton.addEventListener("click", downloadHTML);
modalContent.appendChild(downloadButton);

// Centrar el contenido del modal
modalContent.style.textAlign = "center"; // Centrar todos los elementos dentro de modalContent

// Crear salto de línea
modalContent.appendChild(document.createElement("br"));

// Contenedor para los enlaces de redes sociales
const linksContainer = document.createElement("div");
linksContainer.style.marginTop = "10px";
linksContainer.style.display = "flex"; // Mostrar los enlaces en línea
linksContainer.style.gap = "15px"; // Espacio entre los enlaces
linksContainer.style.justifyContent = "center"; // Centrar los enlaces horizontalmente

// Enlace de LinkedIn
const linkedinLink = document.createElement("a");
linkedinLink.href = "https://www.linkedin.com/in/joseph-fabrizzio-hernandez-gonzalez-045b91270/"; // Cambiar por tu LinkedIn
linkedinLink.textContent = "LinkedIn";
linkedinLink.style.textDecoration = "none"; // Eliminar subrayado
linkedinLink.style.color = "#008CBA"; // Color para el enlace
linkedinLink.target = "_blank"; // Abrir en nueva pestaña
linksContainer.appendChild(linkedinLink);

// Enlace de GitHub
const githubLink = document.createElement("a");
githubLink.href = "https://github.com/JFabrizzio5"; // Cambiar por tu GitHub
githubLink.textContent = "GitHub";
githubLink.style.textDecoration = "none";
githubLink.style.color = "#008CBA";
githubLink.target = "_blank"; // Abrir en nueva pestaña
linksContainer.appendChild(githubLink);

// Enlace del repositorio
const REPOLink = document.createElement("a");
REPOLink.href = "https://github.com/JFabrizzio5/ExtensionHorarioSAES"; // Cambiar por tu GitHub
REPOLink.textContent = "Repositorio";
REPOLink.style.textDecoration = "none";
REPOLink.style.color = "#008CBA";
REPOLink.target = "_blank"; // Abrir en nueva pestaña
linksContainer.appendChild(REPOLink);

// Agregar el contenedor de enlaces al modal
modalContent.appendChild(linksContainer);

// Salto de línea antes de Desarrollador
modalContent.appendChild(document.createElement("br"));

// Agregar texto "Desarrollador: Joseph Fabrizzio"
const developerText = document.createElement("p");
developerText.textContent = "Desarrollador: Joseph Fabrizzio";
developerText.style.fontStyle = "italic"; // Estilo en cursiva
developerText.style.marginTop = "10px";
modalContent.appendChild(developerText);
    // Mostrar modal
    modal.style.display = "block";
  });
}

