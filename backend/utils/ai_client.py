import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY =  "AIzaSyBKnB-A4Gwid87Ossr_0EUV0_NPvn5nzTk"

if not API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing from environment variables!")

# Correct client initialization for NEW GEMINI API
gemini = genai.Client(api_key=API_KEY)

print("Gemini client initialized successfully")


# import qrcode

# # Data you want to store in the QR code
# data = "https://www.amazon.in/l/27943762031?me=ANN76Q1P8IBSV"

# # Create QR code instance
# qr = qrcode.QRCode(
#     version=1,  # size of the QR code (1–40), 1 is smallest
#     error_correction=qrcode.constants.ERROR_CORRECT_L,  
#     box_size=10,  # size of each box in pixels
#     border=2,     # thickness of border
# )

# qr.add_data(data)
# qr.make(fit=True)

# # Create image
# img = qr.make_image(fill_color="black", back_color="white")

# # Save the image
# img.save("my_qr_code.png")

# print("QR Code generated and saved as my_qr_code.png")
