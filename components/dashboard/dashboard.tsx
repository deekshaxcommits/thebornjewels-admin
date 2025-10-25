import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-neutral-800 transition">
                    + Add Product
                </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">₹24,560</p>
                        <p className="text-sm text-neutral-500">+12% from last week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">128</p>
                        <p className="text-sm text-neutral-500">+8 new today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">842</p>
                        <p className="text-sm text-neutral-500">+21 this week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">5</p>
                        <p className="text-sm text-neutral-500">Needs restock soon</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts or Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-neutral-400">
                            [Insert Chart Here]
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm space-y-2">
                            <li className="flex justify-between">
                                <span>#1234</span>
                                <span>₹1,299</span>
                            </li>
                            <li className="flex justify-between">
                                <span>#1233</span>
                                <span>₹2,499</span>
                            </li>
                            <li className="flex justify-between">
                                <span>#1232</span>
                                <span>₹899</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
