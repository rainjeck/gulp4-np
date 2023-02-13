const form = {
  init() {
    // this.inputTel();

    this.setup();
    this.validation();
    this.sending();
  },

  inputTel() {
    // https://github.com/uNmAnNeR/imaskjs
    const elems = document.querySelectorAll('.js-masked');

    if (!elems.length) return;

    elems.forEach(el => {
      let mask = IMask(el, {
        mask: el.dataset.mask
        // lazy: false
      });

      el.addEventListener('focus', e => {
        mask.updateOptions({ lazy: false });
      });

      el.addEventListener('blur', e => {
        mask.updateOptions({ lazy: true });
      });
    });
  },

  setup() {
    this.bouncerSettings = {
      messageAfterField: true,
      messages: {
        missingValue: {
          checkbox: 'Обязательное поле',
          radio: 'Выберите значение',
          select: 'Выберите значение',
          'select-multiple': 'Выберите значение',
          default: 'Обязательное поле'
        },
        patternMismatch: {
          email: 'Не верный формат e-mail',
          default: 'Проверьте формат значения'
        },
        phoneNum: 'Введите верный номер'
      },
      disableSubmit: true
    }
  },

  validation() {
    if (typeof Bouncer === 'undefined') return;

    window.AppBouncer = new Bouncer('[data-bouncer]', this.bouncerSettings);

    document.addEventListener('bouncerRemoveError', e => {
      const field = e.target;
      field.classList.add('is-valid');
    }, false);

    document.addEventListener('bouncerShowError', e => {
      const field = e.target;
      field.classList.remove('is-valid');
    }, false);
  },

  sending() {
    document.addEventListener('bouncerFormValid', e => {
      const form = e.target;
      const type = form.dataset.type;

      if (form.hasAttribute('method')) {
        form.submit();
        return;
      }

      const btn = form.querySelector('[type="submit"]');

      const url = form.getAttribute('data-url');

      const fd = new FormData(form);

      form.classList.add('is-process');
      btn.setAttribute('disabled', true);

      console.log('Do some magic');

      // Demo Sending
      setTimeout(() => {
        form.classList.remove('is-process');
        btn.removeAttribute('disabled');
        form.reset();
      }, 1000);
      return;

      fetch(url, {
        method: 'POST',
        body: fd
      }).then(response => response.json()).then(res => {
        console.log(res);

        form.classList.remove('is-process');
        btn.removeAttribute('disabled');
        form.reset();

        if (res.data.url) {
          window.location.assign(res.data.url);
        }
      });
    }, false);
  }
};
