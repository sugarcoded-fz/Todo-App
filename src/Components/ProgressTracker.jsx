import './progressTracker.css'

const ProgressTracker = (props) => {
    const radius = 75
    const stroke = 8
    const circumference = 2 * Math.PI * radius
    const rounded = Math.round(props.progress)

    const offset = circumference - (rounded / 100) * circumference
    return (
        <>
        <div className='progress-container'>
            <div className='title'>Track your progress for today</div>
            <svg width={200} height={200}>

                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#E0D6C3"
                    strokeWidth={stroke}
                    fill='none'
                />

                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#536878"
                    strokeWidth={stroke}
                    fill='none'
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap= 'round'
                    transform='rotate(-90 100 100)'
                />
            </svg>
            <div className='progress'>{rounded}%</div>
        </div>
        </>
    )
}

export default ProgressTracker
