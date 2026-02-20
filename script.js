const productGrid = document.getElementById("product-grid");
const cartPopup = document.getElementById("cart-popup");
const cartItemsList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const wishlistCount = document.getElementById("wishlist-count");
const filters = document.getElementById("filters");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// ================= LOAD PRODUCTS =================
async function loadProducts(category = "all") {
    let url = "https://fakestoreapi.com/products";

    if (category !== "all") {
        url = `https://fakestoreapi.com/products/category/${category}`;
    }

    const res = await fetch(url);
    const products = await res.json();
    renderProducts(products);
}

// ================= RENDER PRODUCTS =================
function renderProducts(products) {
    productGrid.innerHTML = "";

    products.forEach(product => {
        const inWishlist = wishlist.some(w => w.id === product.id);

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h2>${product.title.slice(0, 40)}</h2>
            <p class="price">₹${product.price}</p>

            <div class="actions">
                <button class="btn buy-now">Buy Now</button>
                <button class="btn add-to-cart">Add to Cart</button>
                <button class="btn outline wishlist-btn">
                    ${inWishlist ? "❤️" : "🤍"}
                </button>
            </div>
        `;

        const cartBtn = card.querySelector(".add-to-cart");
        const wishBtn = card.querySelector(".wishlist-btn");
        const buyBtn = card.querySelector(".buy-now");

        cartBtn.addEventListener("click", () => addToCart(product));
        wishBtn.addEventListener("click", () => toggleWishlist(product, wishBtn));
        buyBtn.addEventListener("click", () => payNow(product));

        productGrid.appendChild(card);
    });
}

// ================= RAZORPAY PAYMENT =================
function payNow(product) {

    const amountInPaise = Math.round(product.price * 100);

    const options = {
        key: "rzp_live_SIGnvbsZyGWdti",
        amount: amountInPaise,
        currency: "INR",
        name: "My Store",
        description: product.title,

        handler: function (response) {
            alert("Payment Successful ✅\nPayment ID: " + response.razorpay_payment_id);
        },

        modal: {
            ondismiss: function () {
                console.log("Payment popup closed");
            }
        }
    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function (response) {
        console.log(response.error);
        alert("Payment Failed ❌\nReason: " + response.error.description);
    });

    rzp.open();
}


// ================= CART FUNCTIONS =================
function addToCart(product) {
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
    showCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    cartCount.textContent = `🛒 ${cart.length}`;

    cartItemsList.innerHTML = cart.map((item, i) =>
        `<li>
            ${item.title.slice(0, 20)}
            <button onclick="removeFromCart(${i})">❌</button>
        </li>`
    ).join("");
}

// ================= WISHLIST =================
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

function updateWishlist() {
    wishlistCount.textContent = `❤️ ${wishlist.length}`;
}

// ================= CART POPUP =================
function showCart() {
    cartPopup.style.display = "block";
    setTimeout(() => {
        cartPopup.style.display = "none";
    }, 3000);
}

// ================= FILTER =================
filters.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        document.querySelectorAll(".filters .btn")
            .forEach(b => b.classList.remove("active"));

        e.target.classList.add("active");
        loadProducts(e.target.dataset.category);
    }
});

// ================= CART CHECKOUT PAYMENT =================
document.getElementById("checkout").addEventListener("click", checkoutCart);

function checkoutCart() {

    if (cart.length === 0) {
        alert("Cart is empty ❌");
        return;
    }

    // Calculate total
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    const amountInPaise = Math.round(totalAmount * 100);

    const options = {
        key: "rzp_live_SIGnvbsZyGWdti", 
        amount: amountInPaise,
        currency: "INR",
        name: "My Store",
        description: "Cart Payment",

        handler: function (response) {
            alert("Payment Successful ✅\nPayment ID: " + response.razorpay_payment_id);

            // Clear cart after success
            cart = [];
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCart();
        },

        modal: {
            ondismiss: function () {
                console.log("Cart payment popup closed");
            }
        }
    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function (response) {
        console.log(response.error);
        alert("Payment Failed ❌\nReason: " + response.error.description);
    });

    rzp.open();
}


// ================= INIT =================
updateCart();
updateWishlist();
loadProducts();
