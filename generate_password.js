function generate_password(length = 12) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
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
    const copyBtn = document.querySelector('.copy-btn'); // Opcional

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
            currentPassword = generate_password(parseInt(length_slider.value));
            passwordDiv.textContent = currentPassword;
        }, 300);
    });

    // copy button function
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(currentPassword);
        alert("Password copied: " + currentPassword);
    });
});