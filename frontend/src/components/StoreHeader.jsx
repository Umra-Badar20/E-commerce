export function StoreHeader({ user, cartCount, search, onSearch, onAccount, onCart, onAddProduct }) {
  return (
    <header className="site-header" id="top">
      <a className="wordmark" href="#top" aria-label="Form and Field home">FORM<span>+</span>FIELD</a>
      <nav className="main-nav" aria-label="Main navigation">
        <a href="#collection">Shop all</a>
        <a href="#story">Our point of view</a>
      </nav>
      <div className="header-actions">
        <label className="search-box">
          <span className="search-icon" aria-hidden="true" />
          <input type="search" placeholder="Find something..." aria-label="Search products" value={search} onChange={(event) => onSearch(event.target.value)} />
        </label>
        {user?.role === 'admin' && <button className="text-button admin-button" onClick={onAddProduct}>Add piece <span>+</span></button>}
        <button className="text-button account-button" onClick={onAccount}>{user ? user.username : 'Account'}</button>
        <button className="cart-button" onClick={onCart} aria-label={`Open bag, ${cartCount} items`}>
          Bag <span className="cart-count">{cartCount.toString().padStart(2, '0')}</span>
        </button>
      </div>
    </header>
  )
}