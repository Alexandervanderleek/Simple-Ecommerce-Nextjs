import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/db/db'
import { formatCurrency, formatNumber } from '@/lib/formaters'


async function getSalesData(){
    const data = await prisma.order.aggregate({
        _sum: {pricePaidCents: true},
        _count: true
    })

    return {
        amount: (data._sum.pricePaidCents || 0)/100,
        numberOfSales: data._count
    }
}

async function getUserData(){

    const [userCount,orderData] = await Promise.all([
         await prisma.user.count(),
         await prisma.order.aggregate({
            _sum: {pricePaidCents: true}
        })
    ])

   

    return {
        userCount: userCount,
        averagePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidCents || 0)/userCount/100
    }
}

const  AdminPage = async () => {
    
    const [salesData, userData] = await Promise.all([ getSalesData(), getUserData()])

  
    return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DashboardCard title='Sales' subtitle={`${formatNumber(salesData.numberOfSales)} Orders`} body={formatCurrency(salesData.amount)} />
        <DashboardCard title='Customers' subtitle={`${formatCurrency(userData.averagePerUser)} Average Value`} body={formatNumber(userData.userCount)} />
        <DashboardCard title='Sales' subtitle={`${formatNumber(salesData.numberOfSales)} Orders`} body={formatCurrency(salesData.amount)} />


    </div>
  )
}

type DashCardProps = {
    title: string,
    subtitle: string,
    body: string
}

function DashboardCard({title, subtitle, body}:DashCardProps){
    return(
        <Card>
        <CardHeader>
            <CardTitle>
                {title}
            </CardTitle>
            <CardDescription>
            {subtitle}
        </CardDescription>
        </CardHeader>
        
        <CardContent>
            <p>{body}</p>
        </CardContent>
    </Card> 
    )
}

export default AdminPage