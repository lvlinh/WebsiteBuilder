import { Link } from "wouter"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">SJJS</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Học viện thần học Dòng Tên
              <br />
              Jesuit School of Theology
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>contact@sjjs.edu.vn</li>
              <li>+84 xxx xxx xxx</li>
              <li>Address here</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Social</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SJJS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
