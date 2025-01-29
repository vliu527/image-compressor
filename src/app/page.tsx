import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Image Compressor
        </h1>
        <ImageUploader />
      </main>
    </div>
  );
}
