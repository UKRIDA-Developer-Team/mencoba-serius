import { AlertTriangle, ArrowRight, Box, ClipboardList, Truck, XCircle } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type InventoryItem = {
    sku: string
    name: string
    category: "cake" | "pastry" | "bread"
    onHand: number
    reorderPoint: number
    leadTimeDays: number
    dailyUsage: number
    unit: "pcs" | "tray" | "kg"
}

type BatchItem = {
    ingredient: string
    batchCode: string
    qty: number
    unit: "kg" | "pack"
    expiresInDays: number
    estimatedValue: number
}

type SupplierOrder = {
    supplier: string
    orderCode: string
    etaDays: number
    status: "on-track" | "late"
    riskSku: string
}

const inventory: InventoryItem[] = [
    {
        sku: "BAG-CRO-001",
        name: "Butter Croissant",
        category: "pastry",
        onHand: 24,
        reorderPoint: 30,
        leadTimeDays: 2,
        dailyUsage: 18,
        unit: "pcs",
    },
    {
        sku: "DK-SRD-002",
        name: "Sourdough Loaf",
        category: "bread",
        onHand: 18,
        reorderPoint: 12,
        leadTimeDays: 1,
        dailyUsage: 8,
        unit: "pcs",
    },
    {
        sku: "TK-CHE-003",
        name: "Cheese Tart",
        category: "cake",
        onHand: 5,
        reorderPoint: 14,
        leadTimeDays: 3,
        dailyUsage: 6,
        unit: "tray",
    },
    {
        sku: "FLR-STR-004",
        name: "Premium Flour",
        category: "bread",
        onHand: 10,
        reorderPoint: 25,
        leadTimeDays: 4,
        dailyUsage: 4,
        unit: "kg",
    },
]

const batches: BatchItem[] = [
    {
        ingredient: "Unsalted Butter",
        batchCode: "BT-APR-11",
        qty: 6,
        unit: "kg",
        expiresInDays: 3,
        estimatedValue: 840000,
    },
    {
        ingredient: "Cream Cheese",
        batchCode: "CC-APR-13",
        qty: 8,
        unit: "pack",
        expiresInDays: 6,
        estimatedValue: 560000,
    },
]

const supplierOrders: SupplierOrder[] = [
    {
        supplier: "PT Nusantara Dairy",
        orderCode: "PO-2404-018",
        etaDays: 1,
        status: "late",
        riskSku: "TK-CHE-003",
    },
    {
        supplier: "Tepung Jaya",
        orderCode: "PO-2404-021",
        etaDays: 2,
        status: "on-track",
        riskSku: "FLR-STR-004",
    },
]

function formatIDR(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value)
}

function getDaysOfCover(item: InventoryItem) {
    if (item.dailyUsage <= 0) {
        return 99
    }

    return Math.floor(item.onHand / item.dailyUsage)
}

function getStatus(item: InventoryItem) {
    if (item.onHand <= item.reorderPoint * 0.7) {
        return "critical"
    }

    if (item.onHand <= item.reorderPoint) {
        return "warning"
    }

    return "healthy"
}

function statusStyles(status: ReturnType<typeof getStatus>) {
    if (status === "critical") {
        return "border-red-200 bg-red-50 text-red-700"
    }

    if (status === "warning") {
        return "border-amber-200 bg-amber-50 text-amber-700"
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

export default function AdminPage() {
    const criticalItems = inventory.filter((item) => getStatus(item) === "critical")
    const expiryRiskValue = batches
        .filter((batch) => batch.expiresInDays <= 5)
        .reduce((sum, batch) => sum + batch.estimatedValue, 0)
    const lateSuppliers = supplierOrders.filter((order) => order.status === "late")

    return (
        <main className="min-h-screen bg-slate-100/70 p-4 pb-24 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                                Inventory Command Center
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                                Pastry Operations, Before-Empty Control
                            </h1>
                            {/* <p className="mt-2 text-sm text-slate-600">
                                Physical checks stay mandatory. Ordering decisions move to risk-first triggers.
                            </p> */}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                            <p className="text-xs text-slate-500">Last sync</p>
                            <p className="text-sm font-semibold text-slate-900">Today, 09:12 WIB</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardDescription>Critical SKUs</CardDescription>
                            <CardTitle className="text-2xl text-red-700">{criticalItems.length}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600">
                            Items below reorder trigger, action needed before noon.
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardDescription>At-Risk Expiry Value</CardDescription>
                            <CardTitle className="text-2xl text-amber-700">{formatIDR(expiryRiskValue)}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600">
                            Value of batches expiring in the next 5 days.
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardDescription>Late Supplier Orders</CardDescription>
                            <CardTitle className="text-2xl text-red-700">{lateSuppliers.length}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600">
                            Purchase orders that can block tomorrow&apos;s production.
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardDescription>Today&apos;s Action Queue</CardDescription>
                            <CardTitle className="text-2xl text-slate-900">
                                {criticalItems.length + lateSuppliers.length}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600">
                            Execute these first before reviewing full inventory.
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <AlertTriangle className="size-4 text-amber-600" />
                                Morning Red List
                            </CardTitle>
                            <CardDescription>
                                3-minute ritual: handle only these items, then continue operations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {criticalItems.length === 0 ? (
                                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                    No critical SKUs this morning.
                                </p>
                            ) : (
                                criticalItems.map((item) => (
                                    <div
                                        key={item.sku}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-red-900">{item.name}</p>
                                            <p className="text-xs text-red-700">
                                                {item.onHand} {item.unit} left, reorder point {item.reorderPoint}
                                            </p>
                                        </div>
                                        <Button variant="destructive" size="sm">
                                            Create PO
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <ClipboardList className="size-4 text-slate-600" />
                                Policy Gate
                            </CardTitle>
                            <CardDescription>
                                Production cannot be finalized with unresolved critical stock.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-slate-700">
                            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                Gate status: <span className="font-semibold text-red-700">Blocked</span>
                            </p>
                            <p>
                                Reason: {criticalItems.length} critical SKU still below reorder point.
                            </p>
                        </CardContent>
                        <CardFooter className="justify-between gap-2">
                            <Button variant="outline" size="sm">
                                Request Override
                            </Button>
                            <Button size="sm">Resolve Now</Button>
                        </CardFooter>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Inventory Ledger</h2>
                        <Button variant="outline" size="sm">
                            Export Audit
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left">SKU</th>
                                        <th className="px-4 py-3 text-left">Item</th>
                                        <th className="px-4 py-3 text-left">On Hand</th>
                                        <th className="px-4 py-3 text-left">Days Left</th>
                                        <th className="px-4 py-3 text-left">Lead Time</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inventory.map((item) => {
                                        const status = getStatus(item)

                                        return (
                                            <tr key={item.sku} className="hover:bg-slate-50/70">
                                                <td className="px-4 py-3 text-xs font-medium text-slate-500">{item.sku}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{item.name}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{item.category}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-800">
                                                    {item.onHand} {item.unit}
                                                </td>
                                                <td className="px-4 py-3 text-slate-800">
                                                    <span className="font-semibold">{getDaysOfCover(item)} days</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{item.leadTimeDays} day(s)</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles(status)}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button size="sm" variant={status === "critical" ? "destructive" : "outline"}>
                                                        {status === "critical" ? "Order Now" : "Adjust"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <XCircle className="size-4 text-amber-600" />
                                Batch Expiry Watch
                            </CardTitle>
                            <CardDescription>
                                Use-first guidance for ingredients with nearest expiry.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {batches.map((batch) => (
                                <div
                                    key={batch.batchCode}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">{batch.ingredient}</p>
                                        <p className="text-xs text-slate-500">
                                            {batch.batchCode} • {batch.qty} {batch.unit}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-amber-700">{batch.expiresInDays} day(s)</p>
                                        <p className="text-xs text-slate-500">{formatIDR(batch.estimatedValue)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <Truck className="size-4 text-slate-600" />
                                Supplier & PO Risk
                            </CardTitle>
                            <CardDescription>
                                Delays that can create unplanned production stop.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {supplierOrders.map((order) => (
                                <div
                                    key={order.orderCode}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-slate-900">{order.supplier}</p>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                order.status === "late"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {order.orderCode} • ETA {order.etaDays} day(s) • risk to {order.riskSku}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="justify-between gap-2">
                            <Button variant="outline" size="sm">
                                Contact Supplier
                            </Button>
                            <Button size="sm">
                                See All POs
                                <ArrowRight className="size-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </section>

                {/* <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                    <div className="flex items-start gap-3">
                        <Box className="mt-0.5 size-4 text-slate-500" />
                        <p>
                            <span className="font-semibold">Why this page exists:</span> physical checks show what is left
                            now; this screen prevents expensive surprises by showing what runs out first, what expires first,
                            and what must be ordered today.
                        </p>
                    </div>
                </section> */}
            </div>
        </main>
    )
}