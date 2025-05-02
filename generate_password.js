/** * Genera la cadena de contraseña final basada en las opciones.
 * @param {number} length - Longitud deseada de la contraseña.
 * @param {boolean} mayus - Incluir mayúsculas.
 * @param {boolean} minus - Incluir minúsculas.
 * @param {boolean} number - Incluir números.
 * @param {boolean} signs - Incluir símbolos.
 * @returns {string} - La contraseña generada o un string vacío si no hay tipos de caracteres seleccionados.
 */
function generate_final_password(length = 12, mayus = true, minus = true, number = true, signs = true) { 
    let characters = "";
    let password = "";

    if (mayus) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (minus) characters += "abcdefghijklmnopqrstuvwxyz";
    if (number) characters += "0123456789";
    if (signs) characters += "!@#$%^&*()_+";

    // Si no se seleccionó ningún tipo de carácter, no se puede generar
    if (characters === "") {
        console.error("Error: No character types selected for password generation."); 
        return ""; // Retornar string vacío para que la función que llama lo maneje
    }

    // Generar la contraseña
    for (let i = 0; i < length; i++) {
        const random_index = Math.floor(Math.random() * characters.length);
        password += characters[random_index];
    }

    return password;
}

/**
 * Obtiene un carácter aleatorio de un conjunto dado.
 * @param {string} characterSet - El string de caracteres permitidos.
 * @returns {string} - Un carácter aleatorio o '?' si el conjunto está vacío.
 */
function getRandomChar(characterSet) {
    // Si el set está vacío o no es válido, devolver un placeholder
    if (!characterSet || characterSet.length === 0) return '?'; 
    const random_index = Math.floor(Math.random() * characterSet.length);
    return characterSet[random_index];
}

/** * Anima la revelación de la contraseña carácter por carácter en un elemento HTML.
 * @param {string} finalPassword - La contraseña final a revelar.
 * @param {HTMLElement} displayElement - El elemento HTML donde mostrar la animación.
 * @param {string} characterSet - El conjunto de caracteres a usar para el efecto aleatorio.
 * @param {object} options - Opciones de animación { revealTimePerChar, updateInterval }.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la animación termina.
 */
function animatePassword(finalPassword, displayElement, characterSet, options = {}) {
    // Retorna una promesa para poder esperar a que termine con await
    return new Promise(resolve => {
        const length = finalPassword.length;
        // Tiempos por defecto para la animación (pueden sobreescribirse con options)
        const revealTimePerChar = options.revealTimePerChar || 100; // ms que tarda en revelarse cada carácter
        const updateInterval = options.updateInterval || 40;     // ms entre cambios de caracteres aleatorios

        let currentDisplayArray = Array(length).fill(''); // Array para construir el display
        let solvedIndex = 0; // Índice del último carácter ya revelado

        // Llenar inicialmente con caracteres aleatorios para el efecto inicial
        for (let k = 0; k < length; k++) {
            currentDisplayArray[k] = getRandomChar(characterSet);
        }
        displayElement.textContent = currentDisplayArray.join(''); // Mostrar estado inicial

        let intervalId = null; // ID para poder limpiar el intervalo

        // Función recursiva que revela un carácter y luego se llama para el siguiente
        function revealNextCharacter() {
            // Limpiar el intervalo anterior si existía
            if (intervalId) clearInterval(intervalId);

            // Condición de salida: si ya se revelaron todos los caracteres
            if (solvedIndex >= length) {
                displayElement.textContent = finalPassword; // Asegurar que se muestre la contraseña final correcta
                resolve(); // Resolver la promesa indicando que la animación terminó
                return;
            }

            const targetChar = finalPassword[solvedIndex]; // El carácter correcto para la posición actual
            let startTime = Date.now(); // Tiempo de inicio para revelar este carácter

            // Iniciar el intervalo para el efecto 'shuffle'
            intervalId = setInterval(() => {
                let now = Date.now(); // Tiempo actual en cada paso del intervalo

                // Construir el array de display en cada paso del shuffle
                for (let i = 0; i < length; i++) {
                    if (i < solvedIndex) {
                        // Caracteres ya revelados (a la izquierda del actual): mostrar el carácter final correcto
                        currentDisplayArray[i] = finalPassword[i]; 
                    } else if (i === solvedIndex) {
                        // Carácter actual (el que se está revelando): mostrar aleatorio hasta que pase el tiempo
                        if (now - startTime < revealTimePerChar) {
                            currentDisplayArray[i] = getRandomChar(characterSet); // Mostrar carácter aleatorio
                        } else {
                            currentDisplayArray[i] = targetChar; // Tiempo cumplido, mostrar el carácter final
                        }
                    } else {
                        // Caracteres siguientes (a la derecha del actual): mostrar siempre aleatorios
                        currentDisplayArray[i] = getRandomChar(characterSet);
                    }
                }
                // Actualizar el contenido del elemento HTML
                displayElement.textContent = currentDisplayArray.join('');

                // Comprobar si ya pasó el tiempo para revelar el carácter actual
                if (now - startTime >= revealTimePerChar) {
                    clearInterval(intervalId); // Detener el shuffle para este carácter
                    currentDisplayArray[solvedIndex] = targetChar; // Asegurar que el carácter correcto está en el array
                    displayElement.textContent = currentDisplayArray.join(''); // Actualizar el display una última vez para este carácter
                    solvedIndex++; // Incrementar el índice para pasar al siguiente carácter
                    revealNextCharacter(); // Llamar recursivamente para revelar el siguiente carácter
                }
            }, updateInterval); // Frecuencia del shuffle
        }

        // Iniciar el proceso de revelación con el primer carácter
        revealNextCharacter();
    });
}

// --- Lógica Principal y Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos del DOM
    const passwordDiv = document.querySelector('.password-content');
    const regenerateBtn = document.querySelector('.regenerate-btn');
    const copyBtn = document.querySelector('.copy-btn');
    const copyAlert = document.querySelector('#alert');
    const check_ABC = document.getElementById("checkbox-mayus");
    const check_abc = document.getElementById("checkbox-minus");
    const check_number = document.getElementById("checkbox-number");
    const check_signs = document.getElementById("checkbox-signs");
    const length_slider = document.getElementById('length-slider');
    const length_value = document.getElementById('length-value');

    // Variables de estado
    let currentPassword = ''; // Almacena la contraseña final generada (para copiar)
    let isAnimating = false; // Flag para saber si la animación está en curso

    // Función helper para obtener el conjunto de caracteres basado en los checkboxes
    function getCurrentCharacterSet() {
        let chars = "";
        if (check_ABC.checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (check_abc.checked) chars += "abcdefghijklmnopqrstuvwxyz";
        if (check_number.checked) chars += "0123456789";
        if (check_signs.checked) chars += "!@#$%^&*()_+";
        // Si no hay ninguno seleccionado, usar un conjunto por defecto para la animación
        return chars === "" ? "abcdefghijklmnopqrstuvwxyz0123456789" : chars; 
    }

    // Función principal que orquesta la generación y animación
    async function generateAndAnimatePassword() {
        // Evitar ejecución si ya hay una animación en curso
        if (isAnimating) return; 

        isAnimating = true; // Marcar inicio de animación
        regenerateBtn.disabled = true; // Deshabilitar botón para evitar clics múltiples
        regenerateBtn.style.opacity = '0.5'; // Feedback visual (opcional)

        // Obtener opciones actuales de los controles
        const len = parseInt(length_slider.value);
        const useMayus = check_ABC.checked;
        const useMinus = check_abc.checked;
        const useNum = check_number.checked;
        const useSigns = check_signs.checked;

        // 1. Generar la contraseña final (sin mostrarla aún)
        const finalPassword = generate_final_password(len, useMayus, useMinus, useNum, useSigns);
        
        // 2. Obtener el set de caracteres completo para usar en la animación
        const characterSetForAnimation = getCurrentCharacterSet();

        // Validar si se pudo generar la contraseña y si hay caracteres para animar
        if (finalPassword === "" || characterSetForAnimation === "") {
             passwordDiv.textContent = "Error: Selecciona opciones"; // Mostrar error al usuario
             currentPassword = ""; // Limpiar contraseña actual
             isAnimating = false; // Marcar fin de pseudo-animación (error)
             regenerateBtn.disabled = false; // Habilitar botón
             regenerateBtn.style.opacity = '1';
             return; // Salir de la función
        }
        
        // Guardar la contraseña final para poder copiarla DESPUÉS de la animación
        currentPassword = finalPassword; 

        // 3. Iniciar la animación y esperar a que termine
        try {
            await animatePassword(finalPassword, passwordDiv, characterSetForAnimation, { 
                revealTimePerChar: 50, // Ajusta estos valores para cambiar la velocidad
                updateInterval: 40      
            });
        } catch (error) {
            console.error("Error during password animation:", error);
             // En caso de error en la animación, mostrar la contraseña final directamente
             passwordDiv.textContent = finalPassword; 
        } finally {
             // Este bloque se ejecuta siempre, haya o no error, cuando la promesa termina
             isAnimating = false; // Marcar fin de animación
             regenerateBtn.disabled = false; // Habilitar botón de nuevo
             regenerateBtn.style.opacity = '1';
        }
    }

    // --- Configuración de Event Listeners ---

    // Generar la contraseña inicial al cargar la página
    generateAndAnimatePassword();

    // Actualizar el display del valor de longitud cuando cambia el slider
    length_slider.addEventListener('input', () => {
        length_value.textContent = length_slider.value;
        // Opcional: Podrías llamar a generateAndAnimatePassword() aquí también si quieres
        // que la contraseña se regenere automáticamente al cambiar la longitud.
    });

    // Regenerar contraseña al hacer clic en el botón
    regenerateBtn.addEventListener('click', function() {
        const icon = this.querySelector('img'); // Asume que hay una imagen dentro del botón

        // Animar el icono de regenerar (si existe)
        if (icon) {
            icon.style.transition = 'transform 0.3s ease';
            icon.style.transform = 'rotate(360deg)';
            // Resetear la rotación después de la animación CSS
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)'; 
            }, 300); // Debe coincidir con la duración de la transición CSS
        }

        // Iniciar la generación y animación de la nueva contraseña
        // Se ejecuta después de iniciar la rotación del icono (no espera a que termine)
        generateAndAnimatePassword(); 
    });

    // Copiar la contraseña al portapapeles
    copyBtn.addEventListener('click', function() {
        // No copiar si no hay contraseña o si la animación está en curso
        if (!currentPassword || isAnimating) { 
             console.warn("Password not available for copying or animation in progress.");
             // Podrías añadir un feedback visual aquí (ej: agitar el botón)
             return; 
         }
        navigator.clipboard.writeText(currentPassword)
            .then(() => {
                // Mostrar alerta de éxito
                copyAlert.classList.add('show');
                // Ocultar la alerta después de un tiempo
                setTimeout(() => {
                    copyAlert.classList.remove('show');
                }, 1500);
            })
            .catch(err => {
                // Manejar errores al copiar (ej: permisos denegados, API no soportada)
                console.error("Error copying password to clipboard: ", err);
                // Podrías mostrar un mensaje de error al usuario
            });
    });

    // Opcional: Regenerar automáticamente si cambian los checkboxes
    // Descomenta esto si quieres que la contraseña cambie al marcar/desmarcar una opción
    /*
    [check_ABC, check_abc, check_number, check_signs].forEach(checkbox => {
        checkbox.addEventListener('change', generateAndAnimatePassword); 
    });
    */
});