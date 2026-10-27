import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const savedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("shop-user") || "null");
  } catch {
    return null;
  }
};

const formatPrice = (amount) => {
  const numericAmount = Number(amount);
  return amount !== null && amount !== undefined && amount !== "" && Number.isFinite(numericAmount)
    ? `PKR ${new Intl.NumberFormat("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount)}`
    : "Price unavailable";
};

function App() {
  const [user, setUser] = useState(savedUser);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [view, setView] = useState("shop");
  const [authMode, setAuthMode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const result = await api("/api/product/");
      setProducts(result.products || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setCartTotal(0);
      return;
    }
    try {
      const result = await api("/api/cart/");
      setCart(result.cart || []);
      setCartTotal(result.total);
    } catch (requestError) {
      setCart([]);
      setCartTotal(0);
      if (requestError.message !== "Unauthorized") setError(requestError.message);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cart]
  );

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const isRegister = authMode === "register";
    const identifier = form.get("identifier");
    const payload = isRegister
      ? {
          username: form.get("username"),
          email: form.get("email"),
          password: form.get("password"),
        }
      : {
          username: identifier,
          email: identifier,
          password: form.get("password"),
        };

    try {
      const result = await api(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const safeUser = {
        _id: result.user._id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
      };
      localStorage.setItem("shop-user", JSON.stringify(safeUser));
      setUser(safeUser);
      setAuthMode("");
      setNotice(isRegister ? "Your account is ready. Welcome in!" : "Welcome back.");
      setTimeout(() => setNotice(""), 3500);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function addToCart(productId) {
    if (!user) {
      setAuthMode("login");
      setError("Sign in to add items to your bag.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setCart(result.cart || []);
      setCartTotal(result.total);
      setNotice("Added to your bag.");
      setTimeout(() => setNotice(""), 2500);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function createProduct(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const isEditing = Boolean(editingProduct);
    try {
      await api(
        isEditing ? `/api/product/${editingProduct._id}` : "/api/product/create",
        { method: isEditing ? "PUT" : "POST", body: form }
      );
      formElement.reset();
      setProductFormOpen(false);
      setEditingProduct(null);
      setNotice(isEditing ? "Your product has been updated." : "Your new piece is live.");
      setTimeout(() => setNotice(""), 3000);
      await loadProducts();
      if (isEditing) await loadCart();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? It will also be removed from customer carts.`)) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api(`/api/product/${product._id}`, { method: "DELETE" });
      setProducts((current) => current.filter((item) => item._id !== product._id));
      await loadCart();
      setNotice("Product deleted.");
      setTimeout(() => setNotice(""), 3000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeFromCart(productId) {
    setBusy(true);
    setError("");
    try {
      const result = await api(`/api/cart/items/${productId}`, { method: "DELETE" });
      setCart(result.cart || []);
      setCartTotal(result.total);
      setNotice("Item removed from your bag.");
      setTimeout(() => setNotice(""), 2500);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    localStorage.removeItem("shop-user");
    setUser(null);
    setCart([]);
    setView("shop");
    setNotice("You’ve been signed out.");
    setTimeout(() => setNotice(""), 2500);
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        <span>Thoughtful goods, made for everyday living</span>
        <span className="announcement-note">A little more considered. A lot more you.</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#home" onClick={() => setView("shop")}>
          FORM<span>&</span>FIELD
          <small>OBJECTS FOR LIVING</small>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === "shop" ? "nav-link active" : "nav-link"} onClick={() => setView("shop")}>Shop all</button>
          <a className="nav-link" href="#story">Our approach</a>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="welcome-user">Hello, {user.username}</span>
              {user.role === "admin" && (
                <button className="text-button admin-shortcut" onClick={() => { setEditingProduct(null); setError(""); setProductFormOpen(true); }}>Add product</button>
              )}
              <button className="text-button" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <button className="text-button" onClick={() => { setError(""); setAuthMode("login"); }}>Sign in</button>
          )}
          <button className={`bag-button ${view === "bag" ? "selected" : ""}`} onClick={() => { setView("bag"); setError(""); }}>
            Bag <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <main id="home">
        {view === "shop" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <p className="eyebrow">THE EVERYDAY EDIT — NO. 01</p>
                <h1>Good things.<br /><em>Well considered.</em></h1>
                <p className="hero-description">A thoughtful collection of pieces for your home, your rituals, and everything in between.</p>
                <button className="button button-dark" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>
                  Explore the collection <span aria-hidden="true">↘</span>
                </button>
              </div>
              <div className="hero-art" role="img" aria-label="Warm, sunlit still life of everyday objects">
                <div className="art-sun" />
                <div className="art-vase"><span /></div>
                <div className="art-book art-book-one" />
                <div className="art-book art-book-two" />
                <div className="art-caption">A slower kind of everyday <span>01 / 04</span></div>
              </div>
              <span className="hero-side-note">MADE TO BE LIVED WITH</span>
            </section>

            <section className="collection section-wrap" id="collection">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">CURATED FOR YOUR SPACE</p>
                  <h2>The collection<span className="period">.</span></h2>
                </div>
                <span className="product-total">{products.length.toString().padStart(2, "0")} OBJECTS</span>
              </div>
              {error && <div className="inline-alert" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
              {products.length ? (
                <div className="product-grid">
                  {products.map((product, index) => (
                    <article className="product-card" key={product._id}>
                      <div className="product-image-wrap">
                        {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="image-placeholder">F&F</div>}
                        <span className="product-index">0{index + 1}</span>
                        <button className="quick-add" onClick={() => addToCart(product._id)} disabled={busy || !Number.isFinite(Number(product.price)) || product.price === null || product.price === ""}>
                          <span aria-hidden="true">+</span> Add to bag
                        </button>
                      </div>
                      <div className="product-meta">
                        <div><h3>{product.name}</h3><p>{product.desc}</p><span className="product-price">{formatPrice(product.price)}</span></div>
                        <span className="product-arrow" aria-hidden="true">↗</span>
                      </div>
                      {user?.role === "admin" && (
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            onClick={() => { setError(""); setEditingProduct(product); setProductFormOpen(false); }}
                            disabled={busy}
                          >
                            Edit product
                          </button>
                          <button type="button" onClick={() => deleteProduct(product)} disabled={busy}>
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-collection">
                  <span className="empty-mark">F&F</span>
                  <p>{error ? "We couldn’t load the collection." : "The collection is taking shape."}</p>
                  <span>Check back soon for considered everyday pieces.</span>
                </div>
              )}
            </section>

            <section className="story-band" id="story">
              <p className="eyebrow">LESS, BUT BETTER</p>
              <p className="story-statement">We believe the things you live with should make you feel <em>something.</em></p>
              <span>FORM & FIELD — OBJECTS FOR LIVING</span>
            </section>
          </>
        ) : (
          <section className="bag-page section-wrap">
            <p className="eyebrow">YOUR EDIT</p>
            <div className="section-heading"><h1>Your bag<span className="period">.</span></h1><button className="text-button" onClick={() => setView("shop")}>Continue shopping ↗</button></div>
            {error && <div className="inline-alert" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
            {!user ? (
              <div className="empty-bag">
                <p>Your bag is waiting.</p>
                <span>Sign in to see the pieces you’ve collected.</span>
                <button className="button button-dark" onClick={() => { setError(""); setAuthMode("login"); }}>Sign in</button>
              </div>
            ) : cart.length ? (
              <div className="bag-list">
                {cart.map((item) => item.product && (
                  <article className="bag-item" key={item._id || item.product._id}>
                    <img src={item.product.image} alt={item.product.name} />
                    <div className="bag-item-info">
                      <h2>{item.product.name}</h2>
                      <p>{item.product.desc}</p>
                      <span className="bag-unit-price">{formatPrice(item.product.price)} each</span>
                    </div>
                    <div className="bag-item-totals">
                      <span className="bag-quantity">QTY&nbsp; {item.quantity}</span>
                      <strong>{formatPrice(item.lineTotal)}</strong>
                      <button
                        className="remove-cart-item"
                        type="button"
                        onClick={() => removeFromCart(item.product._id)}
                        disabled={busy}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
                <div className="bag-total">
                  <span>Cart total</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <p className="bag-note">Your selected pieces are saved in your bag. Happy living.</p>
              </div>
            ) : (
              <div className="empty-bag"><p>A little room for something good.</p><span>Your bag is currently empty.</span><button className="button button-dark" onClick={() => setView("shop")}>Discover the collection</button></div>
            )}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <a className="wordmark footer-mark" href="#home" onClick={() => setView("shop")}>FORM<span>&</span>FIELD<small>OBJECTS FOR LIVING</small></a>
        <p>Made for the everyday, and everything in it.</p>
        <span>© FORM & FIELD 2025</span>
      </footer>

      {notice && <div className="toast" role="status">{notice}</div>}

      {authMode && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setAuthMode(""); setError(""); } }}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="modal-close" aria-label="Close" onClick={() => { setAuthMode(""); setError(""); }}>×</button>
            <p className="eyebrow">{authMode === "register" ? "A GOOD PLACE TO START" : "WELCOME BACK"}</p>
            <h2 id="auth-title">{authMode === "register" ? "Join the everyday." : "Come on in."}</h2>
            <p className="auth-intro">{authMode === "register" ? "Create an account to keep your favorite finds close." : "Sign in to pick up where you left off."}</p>
            <form onSubmit={submitAuth} className="form-stack">
              {authMode === "register" ? (
                <>
                  <label>Your name<input name="username" autoComplete="username" required minLength="2" /></label>
                  <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
                </>
              ) : (
                <label>Username or email<input name="identifier" autoComplete="username" required /></label>
              )}
              <label>Password<input name="password" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} required minLength={authMode === "register" ? "6" : undefined} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-dark form-submit" type="submit" disabled={busy}>{busy ? "One moment…" : authMode === "register" ? "Create account" : "Sign in"} <span aria-hidden="true">↗</span></button>
            </form>
            <p className="auth-switch">{authMode === "register" ? "Already have an account?" : "New around here?"} <button onClick={() => { setError(""); setAuthMode(authMode === "register" ? "login" : "register"); }}>{authMode === "register" ? "Sign in" : "Create an account"}</button></p>
          </section>
        </div>
      )}

      {(productFormOpen || editingProduct) && user?.role === "admin" && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setProductFormOpen(false); setEditingProduct(null); setError(""); } }}>
          <section className="auth-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="product-title">
            <button className="modal-close" aria-label="Close" onClick={() => { setProductFormOpen(false); setEditingProduct(null); setError(""); }}>×</button>
            <p className="eyebrow">{editingProduct ? "REFINE THE DETAILS" : "THE NEXT GOOD THING"}</p>
            <h2 id="product-title">{editingProduct ? "Edit this piece." : "Add a piece."}</h2>
            <p className="auth-intro">{editingProduct ? "Update its details or choose a replacement image." : "Share a new find with the collection."}</p>
            <form className="form-stack" onSubmit={createProduct}>
              <label>Product name<input name="name" defaultValue={editingProduct?.name || ""} required /></label>
              <label>Description<textarea name="desc" rows="3" defaultValue={editingProduct?.desc || ""} required /></label>
              <label>Price (PKR)<input name="price" type="number" min="0" step="0.01" placeholder="0.00" defaultValue={editingProduct?.price ?? ""} required /></label>
              <label>Product image<input name="image" type="file" accept="image/*" required={!editingProduct} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-dark form-submit" type="submit" disabled={busy}>{busy ? "Saving…" : editingProduct ? "Save changes" : "Add to collection"} <span aria-hidden="true">↗</span></button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
