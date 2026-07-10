import { Check } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const Pricing = () => {
  const { isAuthenticated, token, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState("YEARLY");

  const pricingPlans = [
    {
      imgUrl: "/pricing.jpg",
      title: "QUARTERLY",
      price: 18000,
      duration: 3,
    },
    {
      imgUrl: "/pricing.jpg",
      title: "HALF_YEARLY",
      price: 34000,
      duration: 6,
    },
    {
      imgUrl: "/pricing.jpg",
      title: "YEARLY",
      price: 67000,
      duration: 12,
    },
  ];

  const handlePayment = async (amount, planName) => {
    if (!isAuthenticated) {
      toast.warning("Please login to buy a membership plan!");
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    const toastId = toast.loading("Initializing payment...");

    try {
      // 1. Create order on backend
      const { data } = await axios.post(
        "http://localhost:4000/api/payment/checkout",
        { amount, planName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      toast.update(toastId, {
        render: "Payment gateway loaded",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });

      const duration = planName === "QUARTERLY" ? 3 : planName === "HALF_YEARLY" ? 6 : 12;

      // Handle Mock Mode
      if (data.isMock) {
        toast.info("Test Mode: Simulating payment success...");
        // Call backend to verify and update membership
        const verifyRes = await axios.post(
          "http://localhost:4000/api/payment/verify",
          {
            razorpay_order_id: data.orderId,
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
            razorpay_signature: "mock_signature",
            planName,
            duration,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (verifyRes.data.success) {
          toast.success("Membership activated successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error("Failed to activate membership: " + verifyRes.data.message);
        }
        return;
      }

      // Real Razorpay Flow
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Somnath's Physique",
        description: `${planName} Membership Plan`,
        image: "/logo.png",
        order_id: data.orderId,
        handler: async function (response) {
          const verifyToastId = toast.loading("Verifying payment...");
          try {
            const verifyRes = await axios.post(
              "http://localhost:4000/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName,
                duration,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyRes.data.success) {
              toast.update(verifyToastId, {
                render: "Payment verified! Membership upgraded successfully.",
                type: "success",
                isLoading: false,
                autoClose: 2000,
              });
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              toast.update(verifyToastId, {
                render: "Verification failed: " + verifyRes.data.message,
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.update(verifyToastId, {
              render: err.response?.data?.message || "Payment verification failed",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
          }
        },
        prefill: {
          name: user?.name || "Your Name",
          email: user?.email || "youremail@example.com",
          contact: user?.phone || "9999999999",
        },
        theme: {
          color: "#f15a24",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.update(toastId, {
        render: error.response?.data?.message || error.message || "Failed to initialize payment",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <section className="pricing" id="pricing">
      <h1>Somnath's Physique PLANS</h1>
      <div className="wrapper">
        {pricingPlans.map((plan, index) => (
          <div 
            className={`card ${selectedPlan === plan.title ? "selected" : ""}`} 
            key={index}
            onClick={() => setSelectedPlan(plan.title)}
          >
            <img src={plan.imgUrl} alt={`${plan.title} plan`} />

            <div className="title">
              <h1>{plan.title}</h1>
              <h1>PACKAGE</h1>
              <h3>Rs {plan.price}</h3>
              <p>
                For {plan.duration} {plan.duration > 1 ? "Months" : "Month"}
              </p>
            </div>

            <div className="description">
              <p><Check /> Modern Equipment</p>
              <p><Check /> All-Day Free Training</p>
              <p><Check /> Free Restroom Access</p>
              <p><Check /> 24/7 Expert Support</p>
              <p><Check /> 20-Day Freezing Option</p>

              <button
                className={`join-button ${selectedPlan === plan.title ? "highlighted" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan.title);
                  handlePayment(plan.price, plan.title);
                }}
              >
                {selectedPlan === plan.title ? "Selected - Join Now" : "Join Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
