// File: src/components/AuthBackground.tsx

export default function AuthBackground() {
  return (
    <div className="w-[430px] h-[520px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="h-[200px] w-[200px] absolute rounded-full bg-gradient-to-br from-[#1845ad] to-[#23a2f6] -top-20 -left-20"></div>
      <div className="h-[200px] w-[200px] absolute rounded-full bg-gradient-to-r from-[#ff512f] to-[#f09819] -bottom-20 -right-8"></div>
    </div>
  );
}
