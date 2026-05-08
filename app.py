import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import joblib

from tensorflow.keras.models import load_model


st.set_page_config(
    page_title="AI Sales Dashboard",
    layout="wide"
)


@st.cache_data
def load_data():

    df = pd.read_csv(
        "data/sales_data.csv",
        encoding='latin1'
    )

    df.columns = (
        df.columns
        .str.strip()
        .str.replace(' ', '_')
    )

    if "è®°å½•æ•°" in df.columns:
        df.rename(
            columns={"è®°å½•æ•°": "Record_Count"},
            inplace=True
        )

    df['Order.Date'] = pd.to_datetime(df['Order.Date'])
    df['Ship.Date'] = pd.to_datetime(df['Ship.Date'])

    df['Year'] = df['Order.Date'].dt.year
    df['Month'] = df['Order.Date'].dt.month

    return df


df = load_data()

@st.cache_resource
def load_ann_model():

    model = load_model("sales_ann_model.keras")

    x_scaler = joblib.load("x_scaler.pkl")
    y_scaler = joblib.load("y_scaler.pkl")

    return model, x_scaler, y_scaler


model, x_scaler, y_scaler = load_ann_model()

st.title("📊 AI-Powered Global Superstore Dashboard")

st.markdown("---")

st.sidebar.header("🔍 Filter Data")

region = st.sidebar.multiselect(
    "Select Region",
    options=df['Region'].unique(),
    default=df['Region'].unique()
)

category = st.sidebar.multiselect(
    "Select Category",
    options=df['Category'].unique(),
    default=df['Category'].unique()
)

segment = st.sidebar.multiselect(
    "Select Segment",
    options=df['Segment'].unique(),
    default=df['Segment'].unique()
)

filtered_df = df[
    (df['Region'].isin(region)) &
    (df['Category'].isin(category)) &
    (df['Segment'].isin(segment))
]

total_sales = filtered_df['Sales'].sum()
total_profit = filtered_df['Profit'].sum()
total_quantity = filtered_df['Quantity'].sum()
total_orders = filtered_df.shape[0]

col1, col2, col3, col4 = st.columns(4)

col1.metric(
    "💰 Total Sales",
    f"{total_sales:,.0f}"
)

col2.metric(
    "📈 Total Profit",
    f"{total_profit:,.0f}"
)

col3.metric(
    "📦 Quantity Sold",
    f"{total_quantity:,.0f}"
)

col4.metric(
    "🧾 Total Orders",
    f"{total_orders:,}"
)

st.markdown("---")

tab1, tab2, tab3 = st.tabs([
    "📊 Dashboard",
    "📈 Analysis",
    "🤖 AI Forecast"
])


with tab1:

    st.subheader("📈 Sales Trend")

    trend = (
        filtered_df.groupby('Order.Date')['Sales']
        .sum()
        .reset_index()
    )

    fig1 = px.line(
        trend,
        x='Order.Date',
        y='Sales',
        markers=True,
        title="Daily Sales Trend"
    )

    st.plotly_chart(
        fig1,
        use_container_width=True
    )


    col1, col2 = st.columns(2)


    with col1:

        st.subheader("🏆 Top 10 Products")

        top_products = (
            filtered_df.groupby('Product.Name')['Sales']
            .sum()
            .sort_values(ascending=False)
            .head(10)
            .reset_index()
        )

        fig2 = px.bar(
            top_products,
            x='Sales',
            y='Product.Name',
            orientation='h',
            color='Sales',
            title="Best Selling Products"
        )

        st.plotly_chart(
            fig2,
            use_container_width=True
        )


    with col2:

        st.subheader("🌍 Sales by Region")

        region_sales = (
            filtered_df.groupby('Region')['Sales']
            .sum()
            .reset_index()
        )

        fig3 = px.pie(
            region_sales,
            names='Region',
            values='Sales',
            hole=0.4,
            title="Regional Contribution"
        )

        st.plotly_chart(
            fig3,
            use_container_width=True
        )

with tab2:

    st.subheader("📊 Profit vs Discount")

    fig4 = px.scatter(
        filtered_df,
        x='Discount',
        y='Profit',
        color='Category',
        size='Sales',
        hover_data=['Product.Name'],
        title="Impact of Discount on Profit"
    )

    st.plotly_chart(
        fig4,
        use_container_width=True
    )

    st.subheader("📦 Category-wise Sales")

    cat_sales = (
        filtered_df.groupby('Category')['Sales']
        .sum()
        .reset_index()
    )

    fig5 = px.bar(
        cat_sales,
        x='Category',
        y='Sales',
        color='Category',
        title="Sales by Category"
    )

    st.plotly_chart(
        fig5,
        use_container_width=True
    )

    st.subheader("🔥 Monthly Sales Heatmap")

    heatmap_data = (
        filtered_df.groupby(['Year', 'Month'])['Sales']
        .sum()
        .reset_index()
    )

    fig6 = px.density_heatmap(
        heatmap_data,
        x='Month',
        y='Year',
        z='Sales',
        title="Monthly Sales Distribution"
    )

    st.plotly_chart(
        fig6,
        use_container_width=True
    )

with tab3:

    st.subheader("🔮 ANN-Based Sales Forecasting")

    monthly = (
        df.groupby(['Year', 'Month'])['Sales']
        .sum()
        .reset_index()
    )

    monthly['Time_Index'] = np.arange(len(monthly))

    future_month = st.slider(
        "Select Months Ahead",
        min_value=1,
        max_value=12,
        value=3
    )
    future_index = len(monthly) + future_month

    future_scaled = x_scaler.transform(
        [[future_index]]
    )

    pred_scaled = model.predict(
        future_scaled
    )

    prediction = y_scaler.inverse_transform(
        pred_scaled
    )[0][0]

    st.success(
        f"📈 Predicted Sales After "
        f"{future_month} Month(s): "
        f"{prediction:,.0f}"
    )

    forecast_df = pd.DataFrame({
        'Time_Index': [future_index],
        'Sales': [prediction]
    })

    fig7 = px.line(
        monthly,
        x='Time_Index',
        y='Sales',
        title="Historical Sales Trend"
    )

    fig7.add_scatter(
        x=forecast_df['Time_Index'],
        y=forecast_df['Sales'],
        mode='markers',
        name='Future Prediction'
    )

    st.plotly_chart(
        fig7,
        use_container_width=True
    )

    st.subheader("📋 Forecast Details")

    forecast_table = pd.DataFrame({
        "Future Month": [future_month],
        "Predicted Sales": [round(prediction, 2)]
    })

    st.dataframe(
        forecast_table,
        use_container_width=True
    )

st.markdown("---")

st.caption("🚀 Developed with Streamlit + ANN + TensorFlow")
