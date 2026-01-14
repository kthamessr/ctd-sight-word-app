export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    firebaseConfig: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    },
  });
}
