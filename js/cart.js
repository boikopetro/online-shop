class Cart {
  constructor(cartContainer) {
    this.cartContainer = cartContainer;
    this.cart = JSON.parse(localStorage['cart'] || '{}');
    this.addEventListeners();
    this.updateBadge();
  }
  addEventListeners() {
    this.cartContainer.on('show.bs.modal', () => this.renderCart());
    this.cartContainer.find('.order').click(ev => this.order(ev));
  }
  addProduct(id) {
    this.cart[id] = (this.cart[id] || 0) + 1;
    this.saveCart();
    this.updateBadge();
  }
  deleteProduct(id) {
    if (this.cart[id] > 1) {
      this.cart[id] -= 1;
    } else {
      delete this.cart[id];
    }
    this.saveCart();
    this.updateBadge();
  }
  saveCart() {
    localStorage['cart'] = JSON.stringify(this.cart);
  }
  renderCart() {
    let total = 0;
    let cartDomSting = `<div class="container">
                <div class="row">
                    <div class="col-5"><strong>Продукт</strong></div>
                    <div class="col-3"><strong>Ціна</strong></div>
                    <div class="col-2"><strong>Кількість</strong></div>
                </div>`;
    for (const id in this.cart) {
      const product = productList.getProductById(id);
      total += product.price * this.cart[id];
      cartDomSting += `<div class="row" data-id="${id}"> 
                    <div class="col-5">${product.title}</div>
                    <div class="col-3">${product.price}</div>
                    <div class="col-2">${this.cart[id]}</div>
                    <div class="col-1"><button class="btn btn-sm plus">+</button></div>
                    <div class="col-1"><button class="btn btn-sm minus">-</button></div>
                </div>`;
    }
    total = total.toFixed(2);
    cartDomSting += `
                <div class="row">
                    <div class="col-5"><strong>До оплати:</strong></div>
                    <div class="col-3" id="empty"><strong>$${total}</strong></div>
                </div>            
        </div>`;
    this.cartContainer.find('.cart-product-list-container').html(cartDomSting);
    this.cartContainer
      .find('.plus')
      .click(ev => this.changeQuantity(ev, this.addProduct));
    this.cartContainer
      .find('.minus')
      .click(ev => this.changeQuantity(ev, this.deleteProduct));
  }
  changeQuantity(ev, operation) {
    const button = $(ev.target);
    const id = button
      .parent()
      .parent()
      .data('id');
    operation.call(this, id);
    this.renderCart();
  }
  updateBadge() {
    $('#cart-badge').text(Object.keys(this.cart).length);
  }
  order(ev) {
  //start form validation
    let formValidation = false;
    const regexName = /^[А-Ь][а-ь]{1,15}/
    const nameValidation = regexName.test(document.getElementById('client-name').value)
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const emailValidation = regexEmail.test(document.getElementById('client-email').value);
    const regexPhone = /^\+38\(0\d{2}\)\d{3}\-\d{2}\-\d{2}/;
    const phoneValidation = regexPhone.test(document.getElementById('client-tel').value);
    const form = this.cartContainer.find('form')[0];

    if (document.getElementById('empty').textContent==='$0.00') {
      window.showAlert('Ви ще не добавили товар до корзини...', false)
    } else if (document.querySelector('#client-name').value==='') {
      window.showAlert('Будь ласка введіть ім\'я', false);
    } else if (nameValidation !== true) {
      window.showAlert('Невірно введене ім`я', false);
    } else if (document.querySelector('#client-tel').value === '+38(___)___-__-__') {
      window.showAlert('Будь ласка введіть номер телефону', false); 
    } else if (phoneValidation !== true) {
      window.showAlert('Невірно введений номер телефону', false)
    } else if (document.querySelector('#client-email').value==='') {
      window.showAlert('Будь ласка введіть email', false);  
    } else if (emailValidation !== true) {
      window.showAlert('Невірно введений email', false);  
    } else if (emailValidation === true) {
      formValidation = true;  
    } 
    
    

  //end form validation
    if (formValidation) {
      ev.preventDefault();
      fetch('order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientName: document.querySelector('#client-name').value,
          clientEmail: document.querySelector('#client-email').value,
          cart: this.cart
        })
      })
        .then(response => response.text())
        .then(responseText => {
          form.reset();
          this.cart = {};
          this.saveCart();
          this.updateBadge();
          this.renderCart();
          window.showAlert('Дякуємо за покупки! ');
          this.cartContainer.modal('hide');
        })
        .catch(error => showAlert('Щось не так: ' + error, true));
    } 
  }
}

//phone mask
const element = document.getElementById('client-tel');
const maskOption = {
    mask: "+38(000)000-00-00",
    lazy: false
}
const mask = new IMask(element, maskOption)

