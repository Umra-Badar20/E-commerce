import { useState } from 'react'

function AuthDialog({ onClose, onAuth }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault()
    const formValues = Object.fromEntries(new FormData(event.currentTarget).entries())
    const values = mode === 'login'
      ? {
          [formValues.username.includes('@') ? 'email' : 'username']: formValues.username,
          password: formValues.password,
        }
      : formValues
    try {
      setSubmitting(true)
      setError('')
      await onAuth(mode, values)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close account window">×</button>
      <p className="eyebrow">Good to see you</p>
      <h2 id="account-title">{mode === 'login' ? 'Come on in.' : 'Make yourself at home.'}</h2>
      <p className="modal-intro">Sign in to keep your considered finds together.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>{mode === 'login' ? 'Email or username' : 'Username'}<input name="username" autoComplete="username" required /></label>
        {mode === 'register' && <label>Email address<input name="email" type="email" autoComplete="email" required /></label>}
        <label>Password<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="solid-button" type="submit" disabled={submitting}>{submitting ? 'One moment...' : mode === 'login' ? 'Sign in' : 'Create account'} <span>↗</span></button>
      </form>
      <p className="mode-switch">{mode === 'login' ? 'New around here?' : 'Already have an account?'} <button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
    </section>
  )
}

function ProductDialog({ onClose, onSaveProduct, product }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isEditing = Boolean(product)
  const handleSubmit = async (event) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    try {
      setSubmitting(true)
      setError('')
      await onSaveProduct(values, product?._id)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close product form">×</button>
      <p className="eyebrow">Collection management</p>
      <h2 id="product-dialog-title">{isEditing ? 'Edit this piece.' : 'Add a piece.'}</h2>
      <p className="modal-intro">A name, a few words, a price, and a clear photograph.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>Product name<input name="name" defaultValue={product?.name || ''} required /></label>
        <label>Description<textarea name="desc" rows="3" defaultValue={product?.desc || ''} required /></label>
        <label>Price<input name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ''} required /></label>
        <label>Product image<input name="image" type="file" accept="image/*" required={!isEditing} /><small>Images must be 5 MB or smaller.</small></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="solid-button" type="submit" disabled={submitting}>{submitting ? 'Saving piece...' : isEditing ? 'Save changes' : 'Add to collection'} <span>↗</span></button>
      </form>
    </section>
  )
}

function ProfileDialog({ user, onClose, onSignOut }) {
  return (
    <section className="modal-panel profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close account window">×</button>
      <p className="eyebrow">Your account</p>
      <h2 id="profile-title">Hello, {user.username}.</h2>
      <p className="profile-email">{user.email}</p>
      <p className="profile-role">{user.role === 'admin' ? 'Collection administrator' : 'Form + Field member'}</p>
      <button className="solid-button" onClick={onSignOut}>Sign out <span>↗</span></button>
    </section>
  )
}

export function StoreDialogs({ type, onClose, onAuth, onSaveProduct, onSignOut, user, product }) {
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      {type === 'auth' && <AuthDialog onClose={onClose} onAuth={onAuth} />}
      {(type === 'product' || type === 'edit-product') && <ProductDialog onClose={onClose} onSaveProduct={onSaveProduct} product={product} />}
      {type === 'profile' && <ProfileDialog user={user} onClose={onClose} onSignOut={onSignOut} />}
    </div>
  )
}