import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from sklearn.linear_model import LinearRegression
st.set_page_config(page_title="Sales Dashboard", layout="wide")

@st.cache_data
def load_data():
    df = pd.read_csv("data/sales_data.csv", encoding='latin1')

    df.columns = df.columns.str.strip().str.replace(' ', '_')

    if "è®°å½•æ•°" in df.columns:
        df.rename(columns={"è®°å½•æ•°": "Record_Count"}, inplace=True)

    df['Order.Date'] = pd.to_datetime(df['Order.Date'])
    df['Ship.Date'] = pd.to_datetime(df['Ship.Date'])

    df['Year'] = df['Order.Date'].dt.year
    df['Month'] = df['Order.Date'].dt.month

    return df

df = load_data()

st.title("📊 Global Superstore Dashboard")

st.sidebar.header("Filters")

region = st.sidebar.multiselect(
    "Region", df['Region'].unique(), default=df['Region'].unique()
)

category = st.sidebar.multiselect(
    "Category", df['Category'].unique(), default=df['Category'].unique()
)

segment = st.sidebar.multiselect(
    "Segment", df['Segment'].unique(), default=df['Segment'].unique()
)

filtered_df = df[
    (df['Region'].isin(region)) &
    (df['Category'].isin(category)) &
    (df['Segment'].isin(segment))
]

col1, col2, col3, col4 = st.columns(4)

col1.metric("💰 Sales", f"{filtered_df['Sales'].sum():,.0f}")
col2.metric("📈 Profit", f"{filtered_df['Profit'].sum():,.0f}")
col3.metric("📦 Quantity", f"{filtered_df['Quantity'].sum():,.0f}")
col4.metric("🧾 Orders", filtered_df.shape[0])

tab1, tab2, tab3 = st.tabs(["Dashboard", "Analysis", "Prediction"])

with tab1:
    st.subheader("📈 Sales Trend")

    trend = filtered_df.groupby('Order.Date')['Sales'].sum().reset_index()

    fig = px.line(trend, x='Order.Date', y='Sales')
    st.plotly_chart(fig, use_container_width=True)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("🏆 Top Products")

        top_products = (
            filtered_df.groupby('Product.Name')['Sales']
            .sum()
            .sort_values(ascending=False)
            .head(10)
            .reset_index()
        )

        fig2 = px.bar(top_products, x='Sales', y='Product.Name', orientation='h')
        st.plotly_chart(fig2, use_container_width=True)

    with col2:
        st.subheader("🌍 Sales by Region")

        region_sales = filtered_df.groupby('Region')['Sales'].sum().reset_index()

        fig3 = px.pie(region_sales, names='Region', values='Sales')
        st.plotly_chart(fig3, use_container_width=True)

with tab2:
    st.subheader("📊 Profit vs Discount")

    fig4 = px.scatter(
        filtered_df,
        x='Discount',
        y='Profit',
        color='Category'
    )
    st.plotly_chart(fig4, use_container_width=True)

    st.subheader("📦 Category-wise Sales")

    cat_sales = filtered_df.groupby('Category')['Sales'].sum().reset_index()

    fig5 = px.bar(cat_sales, x='Category', y='Sales', color='Category')
    st.plotly_chart(fig5, use_container_width=True)

with tab3:
    st.subheader("🔮 Monthly Sales Prediction")

    monthly = df.groupby(['Year','Month'])['Sales'].sum().reset_index()

    X = np.arange(len(monthly)).reshape(-1,1)
    y = monthly['Sales']

    model = LinearRegression()
    model.fit(X, y)

    future = st.slider("Months Ahead", 1, 12)

    pred = model.predict([[len(monthly) + future]])

    st.success(f"Predicted Sales: {pred[0]:,.0f}")