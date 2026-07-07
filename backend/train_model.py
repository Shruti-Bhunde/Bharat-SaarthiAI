import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# Set random seed for reproducibility
np.random.seed(42)

# Generate synthetic dataset
n_samples = 2000

complaint_types = ['Pothole', 'Garbage', 'Water Leakage', 'Broken Streetlight', 'Broken Road']
severities = ['Low', 'Medium', 'High', 'Critical']
location_types = ['Residential', 'Commercial', 'Highway', 'School Zone', 'Hospital Zone']
times_of_day = ['Morning', 'Afternoon', 'Evening', 'Night']

data = {
    'complaint_type': np.random.choice(complaint_types, n_samples),
    'severity': np.random.choice(severities, n_samples, p=[0.3, 0.4, 0.2, 0.1]),
    'location_type': np.random.choice(location_types, n_samples),
    'traffic_density': np.random.randint(0, 101, n_samples),
    'time_of_day': np.random.choice(times_of_day, n_samples)
}

df = pd.DataFrame(data)

# Let's define rules to calculate a target Risk Score (0-100)
# We will use this to train our models

severity_map = {'Low': 15, 'Medium': 40, 'High': 70, 'Critical': 90}
location_map = {'Residential': 10, 'Commercial': 20, 'Highway': 25, 'School Zone': 35, 'Hospital Zone': 35}
type_map = {'Pothole': 15, 'Garbage': 10, 'Water Leakage': 15, 'Broken Streetlight': 10, 'Broken Road': 20}
time_map = {'Morning': 5, 'Afternoon': 5, 'Evening': 10, 'Night': 15}

def calculate_risk(row):
    base_severity = severity_map[row['severity']]
    score = (
        base_severity * 0.4 +
        location_map[row['location_type']] * 0.15 +
        type_map[row['complaint_type']] * 0.1 +
        time_map[row['time_of_day']] * 0.05 +
        row['traffic_density'] * 0.35
    )
    
    # Floor limits based on critical configurations
    if row['severity'] == 'Critical':
        if row['traffic_density'] > 60:
            score = max(score, 90)
        else:
            score = max(score, 80)
    elif row['severity'] == 'High':
        if row['traffic_density'] > 60:
            score = max(score, 78)
        else:
            score = max(score, 65)

    # Add small noise (-3 to 3) and clip
    noise = np.random.randint(-3, 4)
    final_score = int(np.clip(score + noise, 0, 100))
    
    # Classify priority
    if final_score < 35:
        priority = 'Low'
    elif final_score < 60:
        priority = 'Medium'
    elif final_score < 80:
        priority = 'High'
    else:
        priority = 'Critical'
        
    return pd.Series([final_score, priority])

df[['risk_score', 'priority']] = df.apply(calculate_risk, axis=1)

# Encode categorical variables using LabelEncoders and save them
encoders = {}
for col in ['complaint_type', 'severity', 'location_type', 'time_of_day']:
    le = LabelEncoder()
    # Fit with the full set of categories to ensure proper mapping
    if col == 'complaint_type':
        le.fit(complaint_types)
    elif col == 'severity':
        le.fit(severities)
    elif col == 'location_type':
        le.fit(location_types)
    elif col == 'time_of_day':
        le.fit(times_of_day)
    df[col + '_encoded'] = le.transform(df[col])
    encoders[col] = le

# Prepare features
features = ['complaint_type_encoded', 'severity_encoded', 'location_type_encoded', 'traffic_density', 'time_of_day_encoded']
X = df[features]
y_score = df['risk_score']
y_priority = df['priority']

# Train Random Forest Regressor for Risk Score
regressor = RandomForestRegressor(n_estimators=100, random_state=42)
regressor.fit(X, y_score)

# Train Random Forest Classifier for Priority
classifier = RandomForestClassifier(n_estimators=100, random_state=42)
classifier.fit(X, y_priority)

# Save models and encoders
model_data = {
    'regressor': regressor,
    'classifier': classifier,
    'encoders': encoders,
    'features': features
}

with open('backend/ml_model.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("ML Models trained and saved successfully to backend/ml_model.pkl!")
