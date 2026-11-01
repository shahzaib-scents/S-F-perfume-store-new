let cart = [];
const WHATSAPP_NUMBER = "923124974060";
const DELIVERY_ADVANCE = 250;
const money = n => `Rs. ${Number(n).toLocaleString("en-PK")}`;

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = PRODUCTS.map((p, index) => `
    <article class="product-card ${p.inStock ? "" : "sold-out"}">
      <div class="product-photo">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.closest('.product-photo').classList.add('image-missing');this.alt='Product image unavailable';">
        <span class="product-index">0${index + 1}</span>
        ${p.inStock ? "" : '<span class="stock-label">OUT OF STOCK</span>'}
      </div>
      <div class="product-details">
        <div class="product-meta"><span>${p.category}</span><span>${p.size} · ${p.lasting}</span></div>
        <h3>${p.name}</h3><p class="product-description">${p.description}</p>
        <div class="product-buy"><div class="price">${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}<strong>${money(p.price)}</strong></div>
          ${p.inStock ? `<button class="add-button" type="button" onclick="addToCart('${p.id}')">Add to bag <span>+</span></button>` : '<button class="add-button disabled" type="button" disabled>Currently unavailable</button>'}
        </div>
      </div>
    </article>`).join("");
}
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || !product.inStock) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  updateCart(); openCart();
}
function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  updateCart();
}
function updateCart() {
  document.getElementById("cart-count").textContent = cart.reduce((s, x) => s + x.qty, 0);
  const box = document.getElementById("cart-items");
  if (!cart.length) box.innerHTML = '<div class="empty-bag"><span>✧</span><p>Your bag is waiting.</p><small>Add a fragrance from the collection.</small></div>';
  else box.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return `<div class="cart-item"><img src="${p.image}" alt=""><div class="cart-item-info"><strong>${p.name}</strong><span>${money(p.price)} × ${item.qty}</span><div class="quantity"><button type="button" onclick="changeQty('${p.id}',-1)" aria-label="Decrease">−</button><span>${item.qty}</span><button type="button" onclick="changeQty('${p.id}',1)" aria-label="Increase">+</button></div></div></div>`;
  }).join("");
  const subtotal = cart.reduce((s, item) => s + PRODUCTS.find(p => p.id === item.id).price * item.qty, 0);
  document.getElementById("cart-total").textContent = money(subtotal);
}
function openCart() { document.getElementById("cart-drawer").setAttribute("aria-hidden", "false"); document.body.classList.add("cart-open"); }
function closeCart() { document.getElementById("cart-drawer").setAttribute("aria-hidden", "true"); document.body.classList.remove("cart-open"); }
function createOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `SF-${date}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}
document.getElementById("order-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) { alert("Your bag is empty. Please add a product first."); return; }
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const city = document.getElementById("customer-city").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  if (![name, phone, city, address].every(Boolean)) { alert("Please complete all delivery details."); return; }
  const subtotal = cart.reduce((s, item) => s + PRODUCTS.find(p => p.id === item.id).price * item.qty, 0);
  const lines = cart.map(item => { const p = PRODUCTS.find(product => product.id === item.id); return `• ${p.name} × ${item.qty} — ${money(p.price * item.qty)}`; });
  const message = ["*NEW ORDER — S&F PERFUME STORE*", "", `*Order No:* ${createOrderNumber()}`, "", "*Products:*", ...lines, "", `*Products subtotal:* ${money(subtotal)}`, `*Delivery advance:* ${money(DELIVERY_ADVANCE)}`, `*Total including delivery advance:* ${money(subtotal + DELIVERY_ADVANCE)}`, "", "*Customer details:*", `*Name:* ${name}`, `*Phone:* ${phone}`, `*City:* ${city}`, `*Address:* ${address}`].join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});
renderProducts(); updateCart();
