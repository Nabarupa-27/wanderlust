// BOOTSTRAP FORM VALIDATION 
(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();


// FLASH AUTO HIDE 
document.addEventListener("DOMContentLoaded", () => {
  const flash = document.querySelector(".flash-box");

  if (!flash) return;

  // 1.2 second 
  setTimeout(() => {
    flash.style.opacity = "0";
  }, 3000);

  setTimeout(() => {
    flash.remove();
  }, 3500);
});
