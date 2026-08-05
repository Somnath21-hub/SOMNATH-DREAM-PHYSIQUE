import { Check, X, Shield, Sparkles, Zap, Award } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";

const Pricing = () => {
  const { isAuthenticated, token, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState("YEARLY");

  const pricingPlans = [
    {
      imgUrl: "/img2.jpg",
      title: "QUARTERLY",
      displayName: "Quarterly Pack",
      price: 18000,
      duration: 3,
      badge: "ESSENTIAL",
      icon: Zap,
      colorClass: "quarterly-theme",
      features: [
        { text: "Full gym floor & standard equipment access", available: true },
        { text: "Standard locker room & shower facilities", available: true },
        { text: "1 Free consultation with a certified coach", available: true },
        { text: "Access to online workout planner builder", available: true },
        { text: "Access to recovery steam room", available: false },
        { text: "Free entry to intensive Bootcamps", available: false },
      ]
    },
    {
      imgUrl: "/pricing.jpg",
      title: "HALF_YEARLY",
      displayName: "Half-Yearly Pack",
      price: 34000,
      duration: 6,
      badge: "MOST POPULAR",
      icon: Shield,
      colorClass: "half-yearly-theme",
      features: [
        { text: "Full gym floor & premium equipment access", available: true },
        { text: "3 Free consultations with a certified coach", available: true },
        { text: "Customized workout builder & basic diet plan", available: true },
        { text: "Access to recovery steam room & sauna", available: true },
        { text: "2 Complimentary guest passes per month", available: true },
        { text: "Free entry to intensive Bootcamps", available: false },
      ]
    },
    {
      imgUrl: "/img4.jpg",
      title: "YEARLY",
      displayName: "Yearly VIP Pass",
      price: 67000,
      duration: 12,
      badge: "BEST VALUE",
      icon: Award,
      colorClass: "yearly-theme",
      features: [
        { text: "24/7 Gym access & VIP keycard privileges", available: true },
        { text: "Dedicated personal trainer (2 sessions/mo)", available: true },
        { text: "Weekly custom diet & biomarker tracking", available: true },
        { text: "Unlimited freezing option (up to 30 days)", available: true },
        { text: "VIP locker, steam room & spa amenities", available: true },
        { text: "Free entry to all Bootcamps & guest passes", available: true },
      ]
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
        `${API_URL}/api/payment/checkout`,
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
          `${API_URL}/api/payment/verify`,
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
        name: "Dream Physique",
        description: `${planName} Membership Plan`,
        image: "/logo.png",
        order_id: data.orderId,
        handler: async function (response) {
          const verifyToastId = toast.loading("Verifying payment...");
          try {
            const verifyRes = await axios.post(
              `${API_URL}/api/payment/verify`,
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
      <div className="pricing-container">
        
        <div className="pricing-header">
          <span className="section-badge orange-glow">MEMBERSHIPS</span>
          <h1>DREAM PHYSIQUE PLANS</h1>
          <p>
            Choose the perfect training pack to unlock your peak performance. Enjoy access to elite equipment, custom dietary coaching, and a driven community.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.title;
            return (
              <div 
                className={`pricing-card-premium ${plan.colorClass} ${isSelected ? "selected" : ""}`} 
                key={index}
                onClick={() => setSelectedPlan(plan.title)}
              >
                {plan.badge && (
                  <div className="plan-badge-wrapper">
                    <span className="plan-badge">{plan.badge}</span>
                  </div>
                )}
                
                <div className="card-image-bg">
                  <img src={plan.imgUrl} alt={`${plan.title} plan`} />
                  <div className="image-overlay"></div>
                </div>

                <div className="card-top-content">
                  <div className="plan-icon-header">
                    <IconComponent size={24} />
                    <span className="plan-duration-badge">{plan.duration} Months</span>
                  </div>
                  <h2>{plan.displayName}</h2>
                  <div className="price-tag">
                    <span className="currency-symbol">₹</span>
                    <span className="price-amount">{plan.price.toLocaleString("en-IN")}</span>
                    <span className="price-slash">/</span>
                    <span className="price-period">total</span>
                  </div>
                </div>

                <div className="card-features-list">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className={`feature-row ${feature.available ? "active" : "disabled"}`}>
                      {feature.available ? (
                        <Check size={16} className="feature-icon-check" />
                      ) : (
                        <X size={16} className="feature-icon-x" />
                      )}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`join-plan-btn ${isSelected ? "active-glow" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.title);
                    handlePayment(plan.price, plan.title);
                  }}
                >
                  {isSelected ? "Select & Join Now" : "Choose Plan"}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Pricing;
