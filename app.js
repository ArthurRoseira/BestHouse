const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "7byyz5pa6697",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "5g1KMjE7N78WouS4Rk-O_JC4sNIMdIOLLWEA9USJax4"
});

// element variables
// Selecting itens by class, but can be done by id (i think can be better initially)

//Buttons
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');

const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

// Array where the products will be dinamically stored 
let cart = [];
let buttonsDOM=[];
//structure for classes 
//classes in JS are objects just like in JAVA
class Products{
 //D o this synthax when requesting data from a server
 async getProduct(){
  try{

   let contentful = await client.getEntries({
     content_type: "bestHouseProducts" 
   });
   // let result = await fetch('./products.json') //set a request as HTML XLM
   // let data = await result.json();
   let products = contentful.items; 
   products  = products.map(item =>{
    const {title, price} =item.fields;
    const {id} = item.sys;
    const image = item.fields.image.fields.file.url;
    return{title,price,id,image};
   })
   return products
  }
  catch(error){
   console.log(error);
  }
 }
}
//display products -  this class will be responsible to get the itens from de products and show them
class UI{
 //everything that willbe on the screen
 displayProducts(products){
  let result = '';
  let test ='';
  products.forEach(product => {
   test = product.image;
   result+=`
   <article class="product">
      <div class="img-container">
       <img src= '${test}' alt="product" class = "product-img">
       <button class = "bag-btn" data-id = '${product.id}'>
        <i class="fas fa-shopping-cart"></i>
        add to cart
       </button> <!-- data-id just a data stored in the btn to know wich one is clicked -->
      </div>
      <h3>${product.title}</h3>
      <h4>$${product.price}</h4>
     </article>
  `});
  // very important!! set data-id equals to product id - connect button with each product
  productDOM.innerHTML = result;
 }
 getBagBtns(){
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button =>{
       let id  = button.dataset.id;
       let inCart  = cart.find(item => item.id === id);
       if(inCart){
          button.innerText = 'In Cart';
          button.disabled = true;
       }
       else{
          button.addEventListener('click',(event)=>{
            event.target.innerText='In Cart';
            event.target.disable = true;
            let cartItem = {...Storage.getProduct(id),amount:1};
            // destructuring and adding another field and value
            cart = [...cart,cartItem];//kind of append
            Storage.saveCart(cart);
            this.setCartValues(cart);
            this.addCartItem(cartItem);
            this.showCart()
          });
       }
    })
 }
 setCartValues(cart){
   let tempTotal = 0;
   let itemsTotal = 0;
   cart.map(item=>{
   tempTotal+=item.price*item.amount;
   itemsTotal+=item.amount;
   })
   cartTotal.innerText = parseFloat(tempTotal).toFixed(2);
   cartItems.innerText =itemsTotal;
 }
 addCartItem(item){
   const div  = document.createElement('div');
   div.classList.add('cart-item');
   div.innerHTML =`
      <img src='${item.image}' alt="product">
      <div>
         <h4>${item.title}</h4>
         <h5>$${item.price}</h5>
         <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
         <i class="fas fa-chevron-up" data-id=${item.id}></i>
         <p class="item-amount">${item.amount}</p>
         <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
   `
   cartContent.appendChild(div);//carContent is the actual div related to UI 
 }
 showCart(){
   cartOverlay.classList.add('transparentBcg');
   cartDOM.classList.add('showCart');
 }
 setupAPP(){
  cart = Storage.getCart();
  this.setCartValues(cart);
  this.populateCart(cart);
   cartBtn.addEventListener('click',this.showCart);
   closeCartBtn.addEventListener('click', this.hideCart);
 }
 populateCart(cart){
    cart.forEach(item=> this.addCartItem(item));
 }
 hideCart(){
   cartOverlay.classList.remove('transparentBcg');
   cartDOM.classList.remove('showCart');   
 }
 cartLogic(){
    clearCartBtn.addEventListener('click',()=>{this.clearCart();})//point to the class not the event target
    // event bubbling -> target an event to an element that will be always there
    cartContent.addEventListener(`click`,event=>{
       if(event.target.classList.contains(`remove-item`)){
          let removeItem = event.target;
          let id  = removeItem.dataset.id;
          cartContent.removeChild(removeItem.parentElement.parentElement);
          this.removeItem(id);
       }
       else if (event.target.classList.contains(`fa-chevron-up`)){
         let addAmount = event.target;
         let id = addAmount.dataset.id;
         let tempItem = cart.find(item => item.id === id);
         tempItem.amount = tempItem.amount+1;
         Storage.saveCart(cart);
         this.setCartValues(cart);
         addAmount.nextElementSibling.innerText = tempItem.amount;
       }
       else if (event.target.classList.contains(`fa-chevron-down`)){
          let lowerAmount = event.target;
          let id = lowerAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount  = tempItem.amount -1;
          if (tempItem.amount>0){
            Storage.saveCart(cart);
            this.setCartValues(cart);
            lowerAmount.previousElementSibling.innerTest = tempItem.amount;
          }
          else{
             cartContent.removeChild(lowerAmount.parentElement.parentElement);
             this.removeItem(id);
          }

       }
    })
 } 
 clearCart(){//map is an array method
  let cartItems = cart.map(item => item.id);
  cartItems.forEach(id=>this.removeItem(id)); 
   while(cartContent.children.length>0){
      console.log(cartContent.children);
      cartContent.removeChild(cartContent.children[0]);
   }
 }
 removeItem(id){
  cart = cart.filter(item=> item.id !== id); //filter function creates a new array without the filtered element
  this.setCartValues(cart);
  Storage.saveCart(cart);
  let button = this.getSingleButton(id);
  button.disable = false;
  button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
 }
 getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id);
 }
}
//local storage that will contain the cart itens when the user choses one
class Storage{
   //static method - can be used without instantiate the class
   static saveProducts(products){
      localStorage.setItem("products", JSON.stringify(products));
   }
   static getProduct(id){
      let products = JSON.parse(localStorage.getItem('products'));
      return products.find(product => product.id === id)
   }
   static saveCart(cart){
      localStorage.setItem('cart',JSON.stringify(cart))
   }
   static getCart(){
      return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
   }
}

//Event Listener when the page loads the HTML, creates some objects from the classes above
document.addEventListener("DOMContentLoaded",() => {
 const ui = new UI;
 const products  = new Products;
   //setup aplication
   ui.setupAPP();
 //get all products
 products.getProduct().then(products => {
 ui.displayProducts(products);
 Storage.saveProducts(products);}).then(()=>{
    ui.getBagBtns();
    ui.cartLogic();
 })
 //curly braces for multiple lines of code
});