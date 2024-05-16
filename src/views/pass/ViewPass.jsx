import React from 'react';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import PrintIcon from '@mui/icons-material/Print';
import passlogo from '../../assets/images/passlogo.png';


const ViewPass = ({ open, onClose, passData }) => {

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth={true}
            maxWidth="md"
            className="flex justify-center items-center"
        >
            <Paper className="bg-white p-4 printableArea shadow-md w-full" style={{ width: '800px', height: '270px' }}>                <div className="grid grid-cols-3 gap-4 items-start border-2 border-gray-300 rounded-lg shadow-sm">
                <div className="absolute inset-0">
                    <IconButton onClick={handlePrint} className="fixed top-6 left-6 p-2">
                        <PrintIcon />
                    </IconButton>
                </div>
                <div className="col-span-1 p-2 border-r-2 border-gray-300">
                    <div className='flex flex-col items-center space-y-4 pb-2'>
                        <img src={passlogo} alt="Pass Logo" className="h-16 w-32" />
                        {passData?.visitor.image ? (
                            <img src={`data:image/jpeg;base64,${passData?.visitor.image}`} alt="User" className="h-32 w-32 border-2 border-gray-300 rounded-xl object-cover" />
                        ) : (
                            <div className="h-32 w-32 border-2 border-gray-300 flex items-center justify-center text-white bg-customGreen rounded-xl">
                                {passData?.visitor.first_name ? passData?.visitor.first_name.charAt(0) : 'N/A'}
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-2 flex flex-col space-y-4">
                    <div className='p-2'>
                        <div className="flex justify-center p-2">
                            <h1 className="text-xl font-bold">Temporary Entry Pass</h1>
                        </div>
                        <div className="flex">
                            <div className="flex-1 flex flex-col space-y-4 p-2">
                                <InfoItem label="Name" value={`${passData?.visitor.first_name} ${passData?.visitor.last_name}`} />
                                <InfoItem label="Type" value={passData?.visitor.visitor_type} />
                                <InfoItem label="Purpose" value={passData?.visiting_purpose} />
                            </div>
                            <div className="flex-1 flex flex-col space-y-4 p-2">
                                <InfoItem label="To-Visit" value={passData?.whom_to_visit} />
                                <InfoItem label="Department" value={passData?.visiting_department} />
                                <InfoItem label="Zones" value={passData?.zone_names.join(", ")} />
                            </div>
                        </div>
                        <div className="flex justify-left p-2">
                            <InfoItem label="Valid-Till" value={new Date(passData?.valid_until).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })} />
                        </div>
                    </div>
                </div>
            </div>
            </Paper>
        </Dialog>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="flex items-center space-x-2">
        <span className="font-semibold">{label}:</span>
        <span>{value}</span>
    </div>
);

export default ViewPass;
