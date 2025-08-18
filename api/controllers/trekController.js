const Trek = require('../models/Trek');

exports.getTreks = async (req, res) => {
    try {
        const treks = await Trek.find();
        res.json(treks);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.addTrek = async (req, res) => {
    try {
        const newTrek = new Trek(req.body);
        const trek = await newTrek.save();
        res.json(trek);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateTrek = async (req, res) => {
    try {
        const trek = await Trek.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!trek) return res.status(404).json({ msg: 'Trek not found' });
        res.json(trek);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.deleteTrek = async (req, res) => {
    try {
        const trek = await Trek.findByIdAndRemove(req.params.id);
        if (!trek) return res.status(404).json({ msg: 'Trek not found' });
        res.json({ msg: 'Trek deleted successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};