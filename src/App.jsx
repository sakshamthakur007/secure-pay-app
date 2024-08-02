import { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from '@cashfreepayments/cashfree-js';

function App() {
  const [cashfree, setCashfree] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_phone: "",
    customer_name: "",
    customer_email: "",
    amount: ""
  });

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const cashfreeInstance = await load({ mode: "sandbox" });
        setCashfree(cashfreeInstance);
      } catch (error) {
        console.error("Error loading Cashfree SDK:", error);
      }
    };

    initializeSDK();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getSessionId = async () => {
    try {
      let res = await axios.post("https://secure-pay-api.vercel.app/payment", formData);
      if (res.data && res.data.payment_session_id) {
        setOrderId(res.data.order_id);
        return res.data.payment_session_id;
      }
    } catch (error) {
      console.error("Error getting session ID:", error);
    }
  };

  const verifyPayment = async (orderId) => {
    try {
      let res = await axios.post("https://secure-pay-api.vercel.app/verify", { orderId });
      if (res.data) {
        alert("Payment verified");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      let sessionId = await getSessionId();
      if (sessionId && cashfree) {
        let checkoutOptions = {
          paymentSessionId: sessionId,
          redirectTarget: "_modal",
        };

        cashfree.checkout(checkoutOptions).then(() => {
          console.log("Payment initialized");
          verifyPayment(orderId);
        }).catch(error => {
          console.error("Error initializing payment:", error);
        });
      }
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Cashfree Payment Gateway</h1>
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        <form onSubmit={handleClick} className="space-y-4">
          <input
            type="text"
            name="customer_id"
            placeholder="Customer ID"
            value={formData.customer_id}
            onChange={handleChange}
            className="block w-full p-4 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            required
          />
          <input
            type="text"
            name="customer_phone"
            placeholder="Customer Phone"
            value={formData.customer_phone}
            onChange={handleChange}
            className="block w-full p-4 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            required
          />
          <input
            type="text"
            name="customer_name"
            placeholder="Customer Name"
            value={formData.customer_name}
            onChange={handleChange}
            className="block w-full p-4 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            required
          />
          <input
            type="email"
            name="customer_email"
            placeholder="Customer Email"
            value={formData.customer_email}
            onChange={handleChange}
            className="block w-full p-4 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            required
          />
          <input
  type="text"
  name="amount"
  placeholder="Amount"
  value={formData.amount}
  onChange={handleChange}
  pattern="^\d+(\.\d{1,2})?$"
  title="Please enter a valid amount"
  className="block w-full p-4 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
  required
/>

          <button type="submit" className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white font-bold rounded-lg flex items-center justify-center space-x-2">
            <i className="fas fa-credit-card"></i>
            <span>Pay Now</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
