import React from "react";
import {
  Dumbbell,
  Flame,
  HeartPulse,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Clock,
  Star
} from "lucide-react";

const bootcamps = [
  {
    id: 1,
    title: "HIIT Blast",
    description: "High-intensity interval training designed to maximize calorie burn and supercharge endurance in short, explosive burst circuits.",
    icon: Flame,
    colorClass: "hiit-glow",
    duration: "6 Weeks",
    intensity: "Extreme",
    coach: "Coach Marcus",
    slotsLeft: 4,
    rating: "4.9"
  },
  {
    id: 2,
    title: "Iron Strength",
    description: "Build raw power and structural lean muscle using barbell metrics, compound lifts, and targeted progressive overload.",
    icon: Dumbbell,
    colorClass: "strength-glow",
    duration: "8 Weeks",
    intensity: "High",
    coach: "Coach Sarah",
    slotsLeft: 3,
    rating: "4.8"
  },
  {
    id: 3,
    title: "Cardio Endurance",
    description: "Aerobic and anaerobic conditioning paths designed to improve recovery, lung capacity, and overall stamina levels.",
    icon: HeartPulse,
    colorClass: "cardio-glow",
    duration: "6 Weeks",
    intensity: "Medium-High",
    coach: "Coach David",
    slotsLeft: 5,
    rating: "4.7"
  },
  {
    id: 4,
    title: "Yoga & Mobility",
    description: "Low-impact dynamic flows, deep alignment holding, and restorative breathing patterns for mental clarity and recovery.",
    icon: Sparkles,
    colorClass: "yoga-glow",
    duration: "4 Weeks",
    intensity: "Low-Medium",
    coach: "Coach Elena",
    slotsLeft: 7,
    rating: "5.0"
  }
];

const WorkoutSessions = () => {
  return (
    <section className="workout_session" id="workouts">
      <div className="workout-container">
        
        {/* Top Workout Session Redesign */}
        <div className="workout-intro">
          <div className="text-side">
            <span className="section-badge blue-glow">RECOMMENDED TRAINING</span>
            <h1>ULTIMATE FULL-BODY BLAST</h1>
            <p className="main-desc">
              Experience our signature high-intensity conditioning session designed to build functional power, trim fat, and push your cardiorespiratory limits.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="icon-wrapper">
                  <Target size={20} className="icon-blue" />
                </div>
                <div className="feature-info">
                  <h4>Structured Progression</h4>
                  <p>Targeted sets focusing on power movements followed immediately by active recovery phases.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="icon-wrapper">
                  <TrendingUp size={20} className="icon-blue" />
                </div>
                <div className="feature-info">
                  <h4>Optimized EPOC Effect</h4>
                  <p>Keep your metabolism elevated and burn extra calories for up to 24 hours after completion.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="icon-wrapper">
                  <Award size={20} className="icon-blue" />
                </div>
                <div className="feature-info">
                  <h4>Expert Supervision</h4>
                  <p>One-on-one postural corrections from certified coaches during group dynamics.</p>
                </div>
              </div>
            </div>

            <div className="metrics-bar">
              <div className="metric">
                <span className="metric-label">Duration</span>
                <span className="metric-value">60 Mins</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric">
                <span className="metric-label">Avg. Burn</span>
                <span className="metric-value">650+ Kcal</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric">
                <span className="metric-label">Level</span>
                <span className="metric-value">All Levels</span>
              </div>
            </div>
          </div>

          <div className="visual-side">
            <div className="image-container-wrapper">
              <img src="/img5.jpg" alt="People training in the gym" className="main-workout-img" />
              <div className="image-overlay-card">
                <div className="overlay-header">
                  <div className="pulse-indicator"></div>
                  <span className="overlay-status">CLASS SCHEDULE</span>
                </div>
                <h4>Daily Sessions Available</h4>
                <p>Monday – Saturday | Morning & Evening Slots</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Bootcamps Redesign */}
        <div className="bootcamps-wrapper">
          <div className="bootcamps-header">
            <span className="section-badge orange-glow">INTENSIVE COHORTS</span>
            <h1>FEATURED BOOTCAMPS</h1>
            <p>
              Commit to a highly focused, multi-week challenge with a cohort of peers. Get daily nutritional coaching, intense workouts, and guaranteed progression metrics.
            </p>
          </div>

          <div className="bootcamps-grid">
            {bootcamps.map((camp) => {
              const IconComponent = camp.icon;
              return (
                <div key={camp.id} className={`bootcamp-card-premium ${camp.colorClass}`}>
                  <div className="card-top">
                    <div className="icon-badge">
                      <IconComponent size={24} />
                    </div>
                    <div className="rating-badge">
                      <Star size={14} fill="currentColor" />
                      <span>{camp.rating}</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h3>{camp.title}</h3>
                    <p>{camp.description}</p>
                  </div>

                  <div className="card-meta">
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{camp.duration}</span>
                    </div>
                    <div className="meta-item">
                      <span>Intensity: <strong>{camp.intensity}</strong></span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="cohort-info">
                      <span className="coach-name">{camp.coach}</span>
                      <span className="slots-alert">{camp.slotsLeft} spots left</span>
                    </div>
                    <button className="enroll-btn" onClick={() => {
                      const contactSection = document.getElementById("contact");
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}>
                      Join Camp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WorkoutSessions;
