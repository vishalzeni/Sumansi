import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { API_BASE_URL } from "../config";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    JSON.parse(localStorage.getItem("user"))?.accessToken;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setCartItems(
  Array.isArray(data)
    ? data.map((item) => ({
        productId: item.productId,
        name: item.product?.name,
        price: item.product?.price,
        marketPrice: item.product?.marketPrice,
        image: item.product?.image,
        qty: item.qty || item.quantity || 1,
        size: item.size || (item.product?.sizes?.[0] || ""),
        color: item.color || (item.product?.colors?.[0] || ""),
      }))
    : []
);

    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productOrId, quantity = 1, size = "", color = "") => {
    const token = getToken();
    if (!token) return;

    const productId =
      typeof productOrId === "string" ? productOrId : productOrId.id;

    await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity, size, color }),
    });

    fetchCart();
  };

  const removeFromCart = async (productId, size = "") => {
    const token = getToken();
    if (!token) return;

    await fetch(`${API_BASE_URL}/cart/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, size }),
    });

    fetchCart();
  };

  const clearCart = async () => {
    const token = getToken();
    if (!token) return;

    await fetch(`${API_BASE_URL}/cart/clear`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchCart();
  };

  const updateCartItemQuantity = async (productId, quantity, size = "") => {
    const token = getToken();
    if (!token) return;

    await fetch(`${API_BASE_URL}/cart/update-quantity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity, size }),
    });

    fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        loading,
        updateCartItemQuantity,
        updateQuantity: updateCartItemQuantity, // <-- alias for CartSidebar
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Safer version of the hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.warn("⚠️ useCart must be used within a <CartProvider>");
    return {
      cartItems: [],
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      loading: false,
      updateCartItemQuantity: () => {},
      updateQuantity: () => {}, // <-- fallback
    };
  }
  return context;
};
