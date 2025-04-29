function generate_password(length = 12, mayus = true, minus = true, number = true, signs = true) {
    let characters = "";

    if (mayus) {
        characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (minus) {
        characters += "abcdefghijklmnopqrstuvwxyz";
    }
    if (number) {
        characters += "0123456789";
    }
    if (signs) {
        characters += "!@#$%^&*()_+";
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        const random_index = Math.floor(Math.random() * characters.length);
        password += characters[random_index];
    }

    return password;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const passwordDiv = document.querySelector('.password-content');
    const regenerateBtn = document.querySelector('.regenerate-btn');
    const copyBtn = document.querySelector('.copy-btn');
    const copyAlert = document.querySelector('#alert');

    // Variables de los checkbox
    const check_ABC = document.getElementById("checkbox-mayus");
    const check_abc = document.getElementById("checkbox-minus");
    const check_number = document.getElementById("checkbox-number");
    const check_signs = document.getElementById("checkbox-signs");

    // Length values
    const length_slider = document.getElementById('length-slider');
    const length_value = document.getElementById('length-value');

    // Generar contraseña inicial
    let currentPassword = generate_password();
    passwordDiv.textContent = currentPassword;

    // update length
    length_slider.addEventListener('input', () => {
        length_value.textContent = length_slider.value;
    })

    // Rotación del PNG y generación de nueva contraseña
    regenerateBtn.addEventListener('click', function() {
        const icon = this.querySelector('img'); // Selecciona la imagen PNG
        
        // Añade transición suave (requiere CSS)
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = 'rotate(360deg)';
        
        setTimeout(() => {
            icon.style.transform = 'rotate(0deg)';
            currentPassword = generate_password(
                parseInt(length_slider.value), 
                check_ABC.checked,
                check_abc.checked,
                check_number.checked,
                check_signs.checked
            );
            passwordDiv.textContent = currentPassword;
        }, 300);
    });

    // copy button function
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(currentPassword)
        .then(() => {
            copyAlert.classList.add('show');

            // Ocultar despues de un tiempo
            setTimeout(() => {
                copyAlert.classList.remove('show');
            }, 1500);
        })
        .catch(err => {
            console.error("Error to copy to the clipboard: ", err);
        });
    });
});