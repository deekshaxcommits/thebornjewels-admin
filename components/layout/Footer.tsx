import Logo from '@/public/logo_wo_bg.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Mail } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";



const links = [
    {
        group: 'Shop',
        items: [
            { title: 'New Arrivals', href: '#' },
            { title: 'Necklaces', href: '#' },
            { title: 'Earrings', href: '#' },
            { title: 'Bracelets', href: '#' },
            { title: 'Rings', href: '#' },
            { title: 'Collections', href: '#' },
        ],
    },
    {
        group: 'Customer Care',
        items: [
            { title: 'Contact Us', href: '/contact' },
            { title: 'Shipping & Returns', href: '#' },
            { title: 'FAQs', href: '#' },
            { title: 'Track Your Order', href: '#' },
            { title: 'Care Instructions', href: '#' },
        ],
    },
    {
        group: 'Company',
        items: [
            { title: 'About Us', href: '#' },
            { title: 'Login', href: '/auth/login' },
            { title: 'Register', href: '/auth/register' },
        ],
    },
    {
        group: 'Legal',
        items: [
            { title: 'Privacy Policy', href: '/privacy-policy' },
            { title: 'Terms & Conditions', href: '/terms-and-conditions' },
        ],
    },
]
export default function FooterSection() {
    return (
        <footer className="border-b bg-white pt-20 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="block size-fit">
                            <Image src={Logo} alt='Logo' className='h-20' />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="space-y-4 text-sm">
                                <span className="block font-medium">{link.group}</span>
                                {link.items.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary block duration-150">
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
                    <span className="text-muted-foreground order-last block text-center text-sm md:order-first">© {new Date().getFullYear()} The Born Jewels, All rights reserved</span>
                    <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
                        <Link
                            href="https://www.instagram.com/thebornjewels/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="text-muted-foreground hover:text-primary block"
                        >
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m8.6 2H7.6C5.61 4 4 5.61 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4m.85 1.5a1.25 1.25 0 1 1-1.25 1.25c0-.69.56-1.25 1.25-1.25M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6" />
                            </svg>
                        </Link>

                        {/* Facebook */}
                        <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="text-muted-foreground hover:text-primary block"
                        >
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M22 12a10 10 0 1 0-11.5 9.95V15h-2v-3h2v-2.2C10.5 7.6 12 6 14.8 6c1.2 0 2.2.09 2.5.13v2.9h-1.7c-1.3 0-1.6.63-1.6 1.55V12h3.2l-.5 3h-2.7v6.95A10 10 0 0 0 22 12" />
                            </svg>
                        </Link>

                        {/* WhatsApp */}
                        <Link
                            href="https://wa.me/919311973421?text=hii"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            <IconBrandWhatsapp className="size-6" stroke={1.5} />
                        </Link>

                        {/* Email */}
                        <Link
                            href="mailto:hello@thebornjewels.com"
                            aria-label="Email"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Mail className="size-6" strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
