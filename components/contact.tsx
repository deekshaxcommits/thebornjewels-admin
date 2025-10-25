import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { DM_Serif_Display } from "next/font/google";

const dmFont = DM_Serif_Display({
    subsets: ["latin"],
    weight: "400",
});

export default function ContactSection() {
    return (
        <section className="pt-42">
            <div className="mx-auto max-w-3xl px-8 lg:px-0">
                <h1 className={`text-center text-4xl font-semibold tracking-tight lg:text-5xl ${dmFont.className}`}>
                    Get in Touch
                </h1>
                <p className="mt-4 text-center text-muted-foreground">
                    Have a question about our jewellery or looking for something custom?
                    We’d love to hear from you.
                </p>

                <Card className="mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16">

                    <form
                        action=""
                        className="mt-2 space-y-6"
                    >
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input type="text" id="name" required />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input type="email" id="email" required />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                            <Input type="tel" id="phone" placeholder="+91 98765 43210" />
                        </div>

                        <div>
                            <Label htmlFor="msg">Your Message</Label>
                            <Textarea id="msg" rows={4} placeholder="Tell us what you’re looking for..." />
                        </div>

                        <Button className="w-full">Send Message</Button>
                    </form>
                </Card>
            </div>
        </section>
    )
}
