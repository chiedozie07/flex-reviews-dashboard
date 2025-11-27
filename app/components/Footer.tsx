export default function Footer() {
  const year = new Date().getFullYear(); // server rendered
  return (
    <footer className="w-full border-t bg-gray-800 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-300">
        © {year} Flex Reviews Dashboard - Built by{" "}
        <span className="font-semibold text-gray-300">Chiedozie Ezidiegwu</span>
      </div>
    </footer>
  );
};
