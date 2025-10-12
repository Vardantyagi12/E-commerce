const productGrid = document.getElementById("product-grid");
const cartPopup = document.getElementById("cart-popup");
const cartItemsList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const wishlistCount = document.getElementById("wishlist-count");
const filters = document.getElementById("filters");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Fetch products from FakeStore
async function loadProducts(category = "all") {
    let url = "https://fakestoreapi.com/products";
    if (category !== "all") {
        url = `https://fakestoreapi.com/products/category/${category}`;
    }
    const res = await fetch(url);
    const products = await res.json();
    renderProducts(products);
}

function renderProducts(products) {
    productGrid.innerHTML = "";
    products.forEach(product => {
        const inWishlist = wishlist.some(w => w.id === product.id);
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h2>${product.title}</h2>
      <p class="price">$${product.price}</p>
      <div class="actions">
        <button class="btn add-to-cart">Add to Cart</button>
        <button class="btn outline wishlist-btn">${inWishlist ? "❤️" : "🤍"}</button>
      </div>
    `;
        const cartBtn = card.querySelector(".add-to-cart");
        const wishBtn = card.querySelector(".wishlist-btn");

        cartBtn.addEventListener("click", () => addToCart(product));
        wishBtn.addEventListener("click", () => toggleWishlist(product, wishBtn));

        productGrid.appendChild(card);
    });
}

function addToCart(product) {
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
    showCart();
}

function toggleWishlist(product, btn) {
    if (wishlist.some(w => w.id === product.id)) {
        wishlist = wishlist.filter(w => w.id !== product.id);
        btn.textContent = "🤍";
    } else {
        wishlist.push(product);
        btn.textContent = "❤️";
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlist();
}

function updateCart() {
    cartCount.textContent = `🛒 ${cart.length}`;
    cartItemsList.innerHTML = cart.map((item, i) =>
        `<li>${item.title.slice(0, 15)} <button onclick="removeFromCart(${i})">❌</button></li>`
    ).join("");
}

function updateWishlist() {
    wishlistCount.textContent = `❤️ ${wishlist.length}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

function showCart() {
    cartPopup.style.display = "block";
    setTimeout(() => {
        cartPopup.style.display = "none";
    }, 3000);
}

// Filter buttons
filters.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        document.querySelectorAll(".filters .btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        loadProducts(e.target.dataset.category);
    }
});

// Fake checkout
document.getElementById("fake-checkout").addEventListener("click", () => {
    alert("Checkout complete! (Fake flow)");
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
});

updateCart();
updateWishlist();
loadProducts();
