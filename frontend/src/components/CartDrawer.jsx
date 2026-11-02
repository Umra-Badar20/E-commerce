import { useState } from 'react'

export function CartDrawer({ cart, onClose, onRemove }) {
  const [removingProductId, setRemovingProductId] = useState(null)
  const [removeError, setRemoveError] = useState('')
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const hasUnpricedItems = cart.some((item) => !Number.isFinite(item.product?.price))
  const cartTotal = cart.reduce((total, item) => total + (Number(item.product?.price) || 0) * item.quantity, 0)

  const handleRemove = async (productId) => {
    setRemovingProductId(productId)
    setRemoveError('')
    try {
      await onRemove(productId)
    } catch (error) {
      setRemoveError(error.message)
    } finally {
      setRemovingProductId(null)
    }
  }

  return (
    <div className="dialog-backdrop drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-heading">
          <div><p className="eyebrow">Your selection</p><h2 id="cart-title">The bag <span>({itemCount})</span></h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close bag">×</button>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty"><span className="empty-mark">+</span><p>Your bag is taking a breather.</p><button className="text-button" onClick={onClose}>Back to the collection <span>↗</span></button></div>
        ) : (
          <div className="cart-items">
            {removeError && <p className="form-error" role="alert">{removeError}</p>}
            {cart.map((item) => item.product && (
              <article className="cart-item" key={item.product._id}>
                <img src={item.product.image} alt="" />
                <div>
                  <h3>{item.product.name}</h3>
                  <p>{item.product.desc}</p>
                  <span>Quantity / {item.quantity}</span>
                  <p className="cart-line-price">
                    {Number.isFinite(item.product.price) ? `${item.quantity} × ${item.product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Price not set'}
                  </p>
                  <button
                    className="cart-remove"
                    type="button"
                    disabled={removingProductId === item.product._id}
                    onClick={() => handleRemove(item.product._id)}
                  >
                    {removingProductId === item.product._id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </article>
            ))}
            <p className="cart-footnote">This collection is made for keeping. Checkout is not available yet.</p>
          </div>
        )}
        {cart.length > 0 && (
          <div className="cart-summary" aria-live="polite">
            <div><span>Cart total</span><strong>{hasUnpricedItems ? 'Price needed' : cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
            {hasUnpricedItems && <p>Set prices for all items to calculate the full total.</p>}
          </div>
        )}
      </aside>
    </div>
  )
}