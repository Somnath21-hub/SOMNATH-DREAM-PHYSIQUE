import axios from "axios";
import { API_URL } from "../config";
import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/contact`,
        { name, email, message },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setName("");
      setEmail("");
      setMessage("");
      toast.success(data.message || "Message sent successfully!");
    } catch (error) {
      console.error("Mail send error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        
        {/* Contact Info Side */}
        <div className="contact-info-panel">
          <span className="section-badge blue-glow">GET IN TOUCH</span>
          <h1>LET'S DISCUSS YOUR GOALS</h1>
          <p className="info-intro">
            Have questions about our plans, bootcamps, or personal training? Drop us a message, or visit our facility. Our support team is ready to assist you.
          </p>

          <div className="contact-details-list">
            <div className="detail-item">
              <div className="detail-icon-box">
                <MapPin size={22} />
              </div>
              <div className="detail-text">
                <h4>Our Location</h4>
                <p>Coal India, Newtown, Kolkata</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box">
                <Phone size={22} />
              </div>
              <div className="detail-text">
                <h4>Call Support</h4>
                <p>+91 9876543210</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box">
                <Mail size={22} />
              </div>
              <div className="detail-text">
                <h4>Email Queries</h4>
                <p>support@dreamphysique.com</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box">
                <Clock size={22} />
              </div>
              <div className="detail-text">
                <h4>Gym Hours</h4>
                <p>Mon - Sat: 5:00 AM - 10:00 PM<br />Sun: 6:00 AM - 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className="contact-form-panel">
          <form onSubmit={sendMail} className="glass-contact-form">
            <h2>Send Us a Message</h2>
            <p className="form-subtitle">We will respond within 24 business hours.</p>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                placeholder="Your Name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                placeholder="youremail@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                required
                value={message}
                placeholder="Write your message here... Describe your fitness goals or questions."
                rows={4}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="submit-form-btn" disabled={loading}>
              {loading ? (
                <>
                  <ClipLoader size={18} color="#fff" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default Contact;
