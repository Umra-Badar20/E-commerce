export function ProductGrid({ products, loading, onAdd, onRetry, user, onEdit, onDelete, deletingProductId }) {
  if (loading) return <div className="product-state" role="status">Finding the good things...</div>

  if (products.length === 0) {
    return (
      <div className="product-state empty-state">
        <p>No pieces here just yet.</p>
        <button className="text-button" onClick={onRetry}>Reload collection <span aria-hidden="true">↻</span></button>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => {
        const isOwner = user?.role === 'admin' && String(product.admin?._id) === user.id
        return (
          <article className="product-card" key={product._id}>
            <div className="product-image-wrap">
              <img src={product.image} alt={product.name} loading="lazy" />
              <span className="product-index">{String(index + 1).padStart(2, '0')}</span>
              <button className="add-button" onClick={() => onAdd(product._id)} aria-label={`Add ${product.name} to bag`}><span aria-hidden="true">+</span></button>
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p>{product.desc}</p>
              <p className="product-price">{Number.isFinite(Number(product.price)) ? Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Price not set'}</p>
              {product.admin?.username && <span className="product-maker">Selected by {product.admin.username}</span>}
              {isOwner && (
                <div className="product-admin-actions">
                  <button className="text-button" onClick={() => onEdit(product)}>Edit</button>
                  <button className="text-button delete-product-button" disabled={deletingProductId === product._id} onClick={() => onDelete(product)}>
                    {deletingProductId === product._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}