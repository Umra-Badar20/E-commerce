import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api.js'
import { CartDrawer } from './components/CartDrawer.jsx'
import { ProductGrid } from './components/ProductGrid.jsx'
import { StoreDialogs } from './components/StoreDialogs.jsx'
import { StoreHeader } from './components/StoreHeader.jsx'

const App = () => {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atelier-user'))
    } catch {
      return null
    }
  })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [error, setError] = useState('')

  const loadProducts = async (showLoading = true) => {
    if (showLoading) setLoadingProducts(true)
    try {
      const data = await apiRequest('/api/product')
      setProducts(data.products || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    let active = true
    apiRequest('/api/product')
      .then((data) => {
        if (active) setProducts(data.products || [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoadingProducts(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!user) return

    apiRequest('/api/cart')
      .then((data) => setCart(data.cart || []))
      .catch(() => {
        setUser(null)
        localStorage.removeItem('atelier-user')
      })
  }, [user])

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) =>
      `${product.name} ${product.desc}`.toLowerCase().includes(query),
    )
  }, [products, search])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  const handleAuth = async (mode, formData) => {
    const data = await apiRequest(`/api/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    const nextUser = {
      id: data.user._id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
    }
    localStorage.setItem('atelier-user', JSON.stringify(nextUser))
    setUser(nextUser)
    setDialog(null)
  }

  const handleAddToCart = async (productId) => {
    if (!user) {
      setDialog('auth')
      return
    }

    try {
      const data = await apiRequest('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      setCart(data.cart || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleRemoveFromCart = async (productId) => {
    const data = await apiRequest(`/api/cart/items/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    })
    setCart(data.cart || [])
  }

  const handleSaveProduct = async (formData, productId) => {
    const data = await apiRequest(productId ? `/api/product/${encodeURIComponent(productId)}` : '/api/product/create', {
      method: productId ? 'PATCH' : 'POST',
      body: formData,
    })
    setProducts((current) => productId
      ? current.map((product) => product._id === productId ? data.product : product)
      : [data.product, ...current])
    setDialog(null)
  }

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete “${product.name}” from the collection?`)) return

    setDeletingProductId(product._id)
    try {
      await apiRequest(`/api/product/${encodeURIComponent(product._id)}`, { method: 'DELETE' })
      setProducts((current) => current.filter((item) => item._id !== product._id))
      setCart((current) => current.filter((item) => item.product?._id !== product._id))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleSignOut = () => {
    document.cookie = 'token=; Max-Age=0; path=/'
    localStorage.removeItem('atelier-user')
    setUser(null)
    setCart([])
  }

  return (
    <div className="storefront">
      <StoreHeader
        user={user}
        cartCount={cartCount}
        search={search}
        onSearch={setSearch}
        onAccount={() => setDialog(user ? 'profile' : 'auth')}
        onCart={() => setCartOpen(true)}
            onAddProduct={() => { setEditingProduct(null); setDialog('product') }}
      />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Objects for considered living</p>
            <h1 id="hero-title">Keep the things<br />that <em>mean more.</em></h1>
            <p className="hero-description">A small collection of useful things, made to be kept close and used every day.</p>
            <a className="hero-link" href="#collection">Explore the collection <span aria-hidden="true">↘</span></a>
            <div className="hero-note"><span>01</span><span>Thoughtful by nature</span><span className="note-line" /></div>
          </div>
          <div className="hero-image" role="img" aria-label="Handcrafted home objects arranged on a warm studio shelf">
            <span className="image-caption">Everyday, made exceptional.</span>
          </div>
          <div className="hero-index">FIELD NOTES <span>—</span> 2026</div>
        </section>
        <section className="point-of-view" id="story" aria-labelledby="story-title">
          <p className="eyebrow">A quieter kind of good</p>
          <h2 id="story-title">Buy fewer things.<br /><em>Love them longer.</em></h2>
          <p>We look for the pieces that earn their place: considered in form, made for everyday life, and better with time.</p>
        </section>
        <section className="collection" id="collection" aria-labelledby="collection-title">
          <div className="collection-heading">
            <div>
              <p className="eyebrow">The edit / 01</p>
              <h2 id="collection-title">Objects to live with</h2>
            </div>
            <p className="collection-count">{products.length.toString().padStart(2, '0')} pieces</p>
          </div>
          {error && <div className="notice" role="status">{error}</div>}
          <ProductGrid
            products={visibleProducts}
            loading={loadingProducts}
            onAdd={handleAddToCart}
            onRetry={loadProducts}
            user={user}
            onEdit={(product) => { setDialog('edit-product'); setEditingProduct(product) }}
            onDelete={handleDeleteProduct}
            deletingProductId={deletingProductId}
          />
        </section>
      </main>
      <footer className="footer">
        <a className="wordmark" href="#top">FORM<span>+</span>FIELD</a>
        <span>Useful things, chosen well.</span>
        <span>© 2026 Form + Field</span>
      </footer>
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={handleRemoveFromCart} />}
      {dialog && (
        <StoreDialogs
          type={dialog}
          onClose={() => setDialog(null)}
          onAuth={handleAuth}
          onSaveProduct={handleSaveProduct}
          onSignOut={handleSignOut}
          user={user}
          product={editingProduct}
        />
      )}
    </div>
  )
}

export default App