import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Coffee,
  CreditCard,
  Filter,
  LifeBuoy,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import { ApiError, checkout, getProduct, getProducts, submitSupport, validateCart } from "./api";
import { useCart } from "./cart";
import {
  addRumAction,
  failRumFeatureOperation,
  setDemoRumUser,
  startRumFeatureOperation,
  startRumView,
  succeedRumFeatureOperation
} from "./datadog";
import type { Order, Product } from "./types";

const routeNames: Array<[RegExp, string]> = [
  [/^\/$/, "Home"],
  [/^\/products$/, "Products"],
  [/^\/products\/[^/]+$/, "Product Detail"],
  [/^\/cart$/, "Cart"],
  [/^\/checkout$/, "Checkout"],
  [/^\/order-confirmation$/, "Order Confirmation"],
  [/^\/account$/, "Account"],
  [/^\/support$/, "Support"]
];

export default function App() {
  return (
    <>
      <RouteViewTracker />
      <SyntheticUserBootstrap />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <CartDrawer />
    </>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const cart = useCart();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Tea Shop Demo home">
          <span className="brand-mark">
            <Coffee size={21} />
          </span>
          <span>Tea Shop Demo</span>
        </Link>

        <nav className="main-nav" aria-label="Primary navigation">
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
          <NavLink to="/support">Support</NavLink>
        </nav>

        <div className="header-actions">
          <div className="account-menu">
            <button
              className="icon-button"
              type="button"
              aria-label="Open account menu"
              title="Account"
              onClick={() => setAccountOpen((open) => !open)}
            >
              <User size={19} />
              <ChevronDown size={15} />
            </button>
            {accountOpen ? (
              <div className="account-dropdown">
                <Link to="/account" onClick={() => setAccountOpen(false)}>
                  Account overview
                </Link>
                <Link to="/support" onClick={() => setAccountOpen(false)}>
                  Contact support
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDemoRumUser({
                      id: "manual-demo-user",
                      name: "Manual Demo User",
                      email: "manual.demo@example.com",
                      journey: "manual-navigation"
                    });
                    setAccountOpen(false);
                  }}
                >
                  Set demo RUM user
                </button>
              </div>
            ) : null}
          </div>

          <button className="cart-button" type="button" onClick={cart.openCart}>
            <ShoppingBag size={19} />
            <span>Cart</span>
            <strong>{cart.itemCount}</strong>
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    getProducts()
      .then((response) => {
        if (!active) {
          return;
        }
        setFeatured(response.products.slice(0, 4));
        setError(null);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page home-page">
      <div className="hero">
        <div className="hero-content">
          <span className="eyebrow">Local RUM training storefront</span>
          <h1>Tea Shop Demo</h1>
          <p>
            A small ecommerce flow designed to generate real browser views, actions, resources,
            errors and session replays.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/products">
              Browse products <ArrowRight size={18} />
            </Link>
            <Link className="secondary-action" to="/support">
              Open support <LifeBuoy size={18} />
            </Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Popular picks</span>
            <h2>Featured teas</h2>
          </div>
          <Link className="text-link" to="/products">
            View catalog
          </Link>
        </div>

        {loading ? <LoadingPanel label="Loading featured products" /> : null}
        {error ? <ErrorPanel title="Could not load featured products" message={error} /> : null}
        {!loading && !error ? (
          <div className="product-grid compact-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="signal-band">
        <div>
          <strong>RUM signals</strong>
          <span>Views, actions and resource timings from real navigation.</span>
        </div>
        <div>
          <strong>Replay signals</strong>
          <span>Clicks, scrolls, forms, modals, drawers and route changes.</span>
        </div>
        <div>
          <strong>Error signals</strong>
          <span>Controlled failures for product lookup, payment and support.</span>
        </div>
      </section>
    </section>
  );
}

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    getProducts({ search, category })
      .then((response) => {
        if (!active) {
          return;
        }
        setProducts(response.products);
        setCategories(response.categories);
        setError(null);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setProducts([]);
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category, search]);

  function updateFilters(next: { search?: string; category?: string }) {
    const params = new URLSearchParams();
    const nextSearch = next.search ?? search;
    const nextCategory = next.category ?? category;

    if (nextSearch) {
      params.set("search", nextSearch);
    }
    if (nextCategory) {
      params.set("category", nextCategory);
    }
    setSearchParams(params);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateFilters({ search: searchInput.trim() });
    addRumAction("product_search_submitted", { search: searchInput.trim(), category });
  }

  return (
    <section className="page">
      <div className="page-title">
        <span className="eyebrow">Catalog</span>
        <h1>Products</h1>
        <p>Search, filter, scroll the catalog and open detail pages to generate RUM signals.</p>
      </div>

      <div className="toolbar">
        <form className="search-box" onSubmit={handleSubmit}>
          <Search size={18} />
          <input
            aria-label="Search products"
            placeholder="Search tea, flavor or note"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <label className="select-field">
          <Filter size={18} />
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => updateFilters({ category: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button
          className="ghost-button"
          type="button"
          onClick={() => updateFilters({ search: "server-error" })}
        >
          Trigger search error
        </button>
      </div>

      {loading ? <LoadingPanel label="Loading product catalog" /> : null}
      {error ? (
        <ErrorPanel
          title="Catalog request failed"
          message={error}
          onRetry={() => updateFilters({ search: "", category: "" })}
        />
      ) : null}

      {!loading && !error ? (
        <>
          <div className="result-count">
            Showing <strong>{products.length}</strong> products
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 ? (
            <EmptyState
              title="No teas found"
              message="Try a broader search term or remove the category filter."
              actionLabel="Reset filters"
              onAction={() => updateFilters({ search: "", category: "" })}
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    setLoading(true);
    setQuantity(1);

    getProduct(id)
      .then((response) => {
        if (!active) {
          return;
        }
        setProduct(response);
        setError(null);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setProduct(null);
        setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <LoadingPanel label="Loading product detail" />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page">
        <ErrorPanel
          title="Product not found"
          message={error || "This product does not exist."}
          onRetry={() => {
            window.location.href = "/products";
          }}
        />
      </section>
    );
  }

  return (
    <section className="page detail-page">
      <div className="detail-layout">
        <ProductArt product={product} size="large" />
        <div className="detail-copy">
          <span className="pill">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>

          <dl className="product-facts">
            <div>
              <dt>Origin</dt>
              <dd>{product.origin}</dd>
            </div>
            <div>
              <dt>Caffeine</dt>
              <dd>{product.caffeine}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{product.rating.toFixed(1)} / 5</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>{product.stock} units</dd>
            </div>
          </dl>

          <div className="note-list">
            {product.tastingNotes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>

          <div className="purchase-row">
            <div className="price">{formatCurrency(product.price)}</div>
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <button
              className="primary-action"
              type="button"
              onClick={() => {
                cart.addItem(product, quantity);
                cart.openCart();
              }}
            >
              <ShoppingBag size={18} /> Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CartPage() {
  const cart = useCart();
  const [validation, setValidation] = useState<null | {
    totals: { subtotal: number; shipping: number; total: number };
    warnings: string[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleValidate() {
    setLoading(true);
    setError(null);
    setValidation(null);

    try {
      const result = await validateCart(cart.toApiItems());
      setValidation({
        totals: result.totals,
        warnings: result.warnings
      });
      addRumAction("cart_validated", {
        itemCount: cart.itemCount,
        total: result.totals.total
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <span className="eyebrow">Shopping bag</span>
        <h1>Cart</h1>
        <p>Change quantities, remove items or validate the cart against the API.</p>
      </div>

      {cart.items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse products and add a few teas before checkout."
          actionLabel="Browse products"
          actionHref="/products"
        />
      ) : (
        <div className="cart-layout">
          <div className="line-item-list">
            {cart.items.map((item) => (
              <CartLineItem key={item.product.id} item={item} />
            ))}
          </div>

          <aside className="summary-panel">
            <h2>Order summary</h2>
            <SummaryRow label="Subtotal" value={formatCurrency(cart.subtotal)} />
            <SummaryRow label="Estimated shipping" value={cart.subtotal > 60 ? "Free" : "$5.90"} />
            <SummaryRow
              label="Estimated total"
              value={formatCurrency(cart.subtotal + (cart.subtotal > 60 ? 0 : 5.9))}
              strong
            />

            {error ? <p className="inline-error">{error}</p> : null}
            {validation ? (
              <div className="success-box">
                <CheckCircle2 size={18} />
                <span>Cart validated. Total: {formatCurrency(validation.totals.total)}</span>
              </div>
            ) : null}
            {validation?.warnings.map((warning) => (
              <p className="inline-warning" key={warning}>
                {warning}
              </p>
            ))}

            <button className="secondary-action full-width" type="button" onClick={handleValidate}>
              {loading ? <Loader2 className="spin" size={18} /> : <PackageCheck size={18} />}
              Validate cart
            </button>
            <Link className="primary-action full-width" to="/checkout">
              Checkout <ArrowRight size={18} />
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const started = useRef(false);
  const [form, setForm] = useState({
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    address: "214 Market Street, Austin, TX",
    paymentMethod: "credit-card",
    cardNumber: "4242 4242 4242 4242",
    forcePaymentError: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!started.current) {
      addRumAction("checkout_started", {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal
      });
      started.current = true;
    }
  }, [cart.itemCount, cart.subtotal]);

  if (cart.items.length === 0) {
    return (
      <section className="page">
        <EmptyState
          title="No checkout yet"
          message="Add products to your cart to complete the checkout journey."
          actionLabel="Browse products"
          actionHref="/products"
        />
      </section>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const checkoutOperationKey = createOperationKey("checkout");
    startRumFeatureOperation("checkout", {
      operationKey: checkoutOperationKey,
      description: "submit_order",
      context: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        paymentMethod: form.paymentMethod,
        forcePaymentError: form.forcePaymentError
      }
    });

    try {
      const order = await checkout({
        customer: {
          name: form.name,
          email: form.email,
          address: form.address
        },
        payment: {
          method: form.paymentMethod,
          cardNumber: form.cardNumber,
          forcePaymentError: form.forcePaymentError
        },
        items: cart.toApiItems()
      });

      window.sessionStorage.setItem("tea-shop-demo-last-order", JSON.stringify(order));
      addRumAction("checkout_completed", {
        orderId: order.id,
        total: order.totals.total,
        itemCount: cart.itemCount
      });
      succeedRumFeatureOperation("checkout", {
        operationKey: checkoutOperationKey,
        description: "submit_order",
        context: {
          orderId: order.id,
          total: order.totals.total,
          itemCount: cart.itemCount
        }
      });
      cart.clearCart();
      navigate("/order-confirmation", { state: { order } });
    } catch (requestError) {
      failRumFeatureOperation("checkout", "error", {
        operationKey: checkoutOperationKey,
        description: "submit_order",
        context: {
          itemCount: cart.itemCount,
          paymentMethod: form.paymentMethod,
          errorStatus: requestError instanceof ApiError ? requestError.status : null,
          errorCode: requestError instanceof ApiError ? requestError.code || null : null
        }
      });
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <span className="eyebrow">Checkout</span>
        <h1>Payment and delivery</h1>
        <p>Submit the form for a successful order or trigger a controlled payment failure.</p>
      </div>

      <div className="checkout-layout">
        <form className="form-panel" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="name"
              value={form.name}
              autoComplete="name"
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Address
            <textarea
              name="address"
              value={form.address}
              autoComplete="street-address"
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              required
            />
          </label>
          <label>
            Payment method
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
            >
              <option value="credit-card">Credit card</option>
              <option value="pix">Pix demo</option>
              <option value="unstable-card">Unstable card (demo error)</option>
            </select>
          </label>
          <label>
            Card number
            <input
              name="cardNumber"
              value={form.cardNumber}
              inputMode="numeric"
              onChange={(event) => setForm({ ...form, cardNumber: event.target.value })}
            />
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.forcePaymentError}
              onChange={(event) => setForm({ ...form, forcePaymentError: event.target.checked })}
            />
            Force payment failure
          </label>

          {error ? <p className="inline-error">{error}</p> : null}

          <button className="primary-action full-width" type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={18} /> : <CreditCard size={18} />}
            Pay now
          </button>
        </form>

        <aside className="summary-panel">
          <h2>Review</h2>
          {cart.items.map((item) => (
            <SummaryRow
              key={item.product.id}
              label={`${item.quantity}x ${item.product.name}`}
              value={formatCurrency(item.product.price * item.quantity)}
            />
          ))}
          <SummaryRow label="Subtotal" value={formatCurrency(cart.subtotal)} />
          <SummaryRow label="Shipping" value={cart.subtotal > 60 ? "Free" : "$5.90"} />
          <SummaryRow
            label="Total"
            value={formatCurrency(cart.subtotal + (cart.subtotal > 60 ? 0 : 5.9))}
            strong
          />
        </aside>
      </div>
    </section>
  );
}

function OrderConfirmationPage() {
  const location = useLocation();
  const state = location.state as { order?: Order } | null;
  const order = useMemo(() => {
    if (state?.order) {
      return state.order;
    }

    const raw = window.sessionStorage.getItem("tea-shop-demo-last-order");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Order;
    } catch {
      return null;
    }
  }, [state]);

  if (!order) {
    return (
      <section className="page">
        <EmptyState
          title="No recent order"
          message="Complete a checkout to see the confirmation page."
          actionLabel="Start shopping"
          actionHref="/products"
        />
      </section>
    );
  }

  return (
    <section className="page confirmation-page">
      <div className="confirmation-box">
        <CheckCircle2 size={42} />
        <span className="eyebrow">Order confirmed</span>
        <h1>{order.id}</h1>
        <p>
          Thanks, {order.customer.name}. A fake receipt was sent to {order.customer.email}.
        </p>
        <div className="summary-panel embedded-summary">
          <SummaryRow label="Status" value={order.status} />
          <SummaryRow label="Total" value={formatCurrency(order.totals.total)} strong />
        </div>
        <Link className="primary-action" to="/products">
          Continue browsing <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function AccountPage() {
  const [message, setMessage] = useState("");

  return (
    <section className="page">
      <div className="page-title">
        <span className="eyebrow">Customer area</span>
        <h1>Account</h1>
        <p>Fake customer data for profile and account view tracking.</p>
      </div>

      <div className="account-layout">
        <section className="profile-panel">
          <div className="avatar">AM</div>
          <h2>Alex Morgan</h2>
          <p>alex.morgan@example.com</p>
          <p>Tea Club Gold member since 2024</p>
          <button
            className="secondary-action"
            type="button"
            onClick={() => {
              setDemoRumUser({
                id: "manual-alex-morgan",
                name: "Alex Morgan",
                email: "alex.morgan@example.com",
                journey: "account-profile"
              });
              setMessage("Demo RUM user set for this browser session.");
            }}
          >
            <User size={18} />
            Set as RUM user
          </button>
          {message ? <p className="success-text">{message}</p> : null}
        </section>

        <section className="orders-panel">
          <h2>Recent orders</h2>
          {["TSD-MAY-107", "TSD-APR-842", "TSD-MAR-315"].map((orderId, index) => (
            <div className="order-row" key={orderId}>
              <PackageCheck size={19} />
              <div>
                <strong>{orderId}</strong>
                <span>{index === 0 ? "Delivered yesterday" : "Delivered"}</span>
              </div>
              <Link to="/support">Need help</Link>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

function SupportPage() {
  const [form, setForm] = useState({
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    subject: "Shipping question",
    message: "Can you confirm when my tea subscription renews?",
    priority: "normal"
  });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setTicket(null);
    setError(null);

    try {
      const response = await submitSupport(form);
      setTicket(response.ticket.id);
      addRumAction("support_ticket_submitted", {
        ticketId: response.ticket.id,
        priority: form.priority,
        subject: form.subject
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <span className="eyebrow">Support</span>
        <h1>Contact support</h1>
        <p>Submit a valid ticket or use a subject containing "erro" to trigger a demo failure.</p>
      </div>

      <form className="form-panel narrow" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Priority
          <select
            name="priority"
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Subject
          <input
            name="subject"
            value={form.subject}
            onChange={(event) => setForm({ ...form, subject: event.target.value })}
            required
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            required
          />
        </label>

        {ticket ? (
          <div className="success-box">
            <CheckCircle2 size={18} />
            <span>Ticket {ticket} created.</span>
          </div>
        ) : null}
        {error ? <p className="inline-error">{error}</p> : null}

        <button className="primary-action full-width" type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <LifeBuoy size={18} />}
          Submit ticket
        </button>
      </form>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="page">
      <ErrorPanel
        title="Page not found"
        message="This route is not part of the demo storefront."
        onRetry={() => {
          window.location.href = "/";
        }}
      />
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const cart = useCart();

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} aria-label={`Open ${product.name}`}>
        <ProductArt product={product} />
      </Link>
      <div className="product-card-body">
        <div className="card-topline">
          <span>{product.category}</span>
          <strong>{product.rating.toFixed(1)}</strong>
        </div>
        <h3>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p>{product.description}</p>
        <div className="note-list small">
          {product.tastingNotes.slice(0, 3).map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
        <div className="card-actions">
          <span className="price">{formatCurrency(product.price)}</span>
          <button
            type="button"
            className="secondary-action compact"
            onClick={() => {
              cart.addItem(product, 1);
              cart.openCart();
            }}
          >
            <ShoppingBag size={17} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductArt({ product, size = "normal" }: { product: Product; size?: "normal" | "large" }) {
  return (
    <div className={`product-art tone-${product.imageTone} ${size}`}>
      <span>{product.badge}</span>
      <strong>{product.name}</strong>
    </div>
  );
}

function CartDrawer() {
  const cart = useCart();

  if (!cart.isCartOpen) {
    return null;
  }

  return (
    <div className="drawer-backdrop" onClick={cart.closeCart} role="presentation">
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Drawer</span>
            <h2>Cart preview</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close cart drawer"
            title="Close"
            onClick={cart.closeCart}
          >
            <X size={20} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <EmptyState title="Cart is empty" message="Add products to see them here." compact />
        ) : (
          <>
            <div className="drawer-items">
              {cart.items.map((item) => (
                <CartLineItem key={item.product.id} item={item} compact />
              ))}
            </div>
            <div className="drawer-footer">
              <SummaryRow label="Subtotal" value={formatCurrency(cart.subtotal)} strong />
              <Link className="secondary-action full-width" to="/cart" onClick={cart.closeCart}>
                Review cart
              </Link>
              <Link className="primary-action full-width" to="/checkout" onClick={cart.closeCart}>
                Checkout <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function CartLineItem({ item, compact = false }: { item: { product: Product; quantity: number }; compact?: boolean }) {
  const cart = useCart();

  return (
    <div className={`line-item ${compact ? "compact-line" : ""}`}>
      <ProductArt product={item.product} />
      <div className="line-copy">
        <strong>{item.product.name}</strong>
        <span>{formatCurrency(item.product.price)} each</span>
        <QuantityStepper
          value={item.quantity}
          onChange={(nextQuantity) => cart.updateQuantity(item.product.id, nextQuantity)}
          compact
        />
      </div>
      <button
        className="icon-button danger"
        type="button"
        aria-label={`Remove ${item.product.name}`}
        title="Remove"
        onClick={() => cart.removeItem(item.product.id)}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
  compact = false
}: {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={`quantity-stepper ${compact ? "compact-stepper" : ""}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        title="Decrease"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus size={16} />
      </button>
      <input
        aria-label="Quantity"
        value={value}
        inputMode="numeric"
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (!Number.isNaN(nextValue)) {
            onChange(nextValue);
          }
        }}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        title="Increase"
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="state-panel">
      <Loader2 className="spin" size={24} />
      <span>{label}</span>
    </div>
  );
}

function ErrorPanel({
  title,
  message,
  onRetry
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-panel error-state">
      <AlertTriangle size={25} />
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button className="secondary-action" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  compact = false
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`state-panel empty-state ${compact ? "compact-empty" : ""}`}>
      <ShoppingBag size={compact ? 22 : 32} />
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link className="primary-action" to={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <button className="primary-action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`summary-row ${strong ? "strong" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RouteViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const match = routeNames.find(([pattern]) => pattern.test(location.pathname));
    startRumView(match?.[1] || "Unknown Route", {
      path: location.pathname,
      search: location.search
    });
  }, [location.pathname, location.search]);

  return null;
}

function SyntheticUserBootstrap() {
  const location = useLocation();
  const navigate = useNavigate();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const userId = params.get("demoUserId");
    const name = params.get("demoUserName");
    const email = params.get("demoUserEmail");
    const journey = params.get("journey");

    if (userId && name && email) {
      const user = { id: userId, name, email, journey: journey || "synthetic" };
      window.sessionStorage.setItem("tea-shop-demo-rum-user", JSON.stringify(user));
      setDemoRumUser(user);

      params.delete("demoUserId");
      params.delete("demoUserName");
      params.delete("demoUserEmail");
      params.delete("journey");

      navigate(
        {
          pathname: location.pathname,
          search: params.toString()
        },
        { replace: true }
      );
      bootstrapped.current = true;
      return;
    }

    const storedUser = window.sessionStorage.getItem("tea-shop-demo-rum-user");
    if (storedUser) {
      try {
        setDemoRumUser(JSON.parse(storedUser));
      } catch {
        window.sessionStorage.removeItem("tea-shop-demo-rum-user");
      }
    }

    bootstrapped.current = true;
  }, [location.pathname, location.search, navigate]);

  return null;
}

function createOperationKey(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return `${error.message} (${error.status}${error.code ? `, ${error.code}` : ""})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}
