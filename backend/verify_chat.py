import httpx
import uuid
import os
import asyncio

async def test_chat_flow():
    base_url = "http://localhost:8000"
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"

    print(f"1. Creating user {email}...")
    async with httpx.AsyncClient() as client:
        # 1. Signup
        signup_payload = {"email": email, "password": password}
        response = await client.post(f"{base_url}/api/auth/signup", json=signup_payload)

        if response.status_code != 201:
            print(f"Signup failed: {response.text}")
            return

        print("Signup success")

        # 2. Signin to get token
        signin_payload = {"email": email, "password": password}
        response = await client.post(f"{base_url}/api/auth/signin", json=signin_payload)

        if response.status_code != 200:
            print(f"Signin failed: {response.text}")
            return

        data = response.json()
        token = data["access_token"]
        print(f"Got token: {token[:10]}...")

        # 3. Send chat message
        print("\n3. Sending chat message: 'Add buy milk to my list'...")
        headers = {"Authorization": f"Bearer {token}"}
        chat_payload = {"message": "Add buy milk to my list"}

        # Increase timeout for AI response
        response = await client.post(
            f"{base_url}/chat/",
            json=chat_payload,
            headers=headers,
            timeout=30.0
        )

        if response.status_code != 200:
            print(f"Chat failed: {response.text}")
            return

        chat_response = response.json()
        print(f"AI Response: {chat_response['response']}")

        # 4. Verify Todo was created
        print("\n4. Verifying todo creation...")
        # Since we don't have a direct todos endpoint exposed in main.py in the snippets we saw earlier,
        # we'll use the 'get_todos' tool via another chat message to verify

        check_payload = {"message": "What is on my list?", "conversation_id": chat_response["conversation_id"]}
        response = await client.post(
            f"{base_url}/chat/",
            json=check_payload,
            headers=headers,
            timeout=30.0
        )

        if response.status_code == 200:
            print(f"Verification AI Response: {response.json()['response']}")
        else:
            print(f"Verification failed: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_chat_flow())
