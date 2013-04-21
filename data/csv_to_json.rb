require 'csv'
require 'json'

observations = {}
targets = {}

def seconds_since_epoch date_time_string
    DateTime.strptime(date_time_string, '%Y-%m-%d %H:%M:%S').to_time.to_i
end

CSV.read(ARGV[0]).each do |x|
    target = x[2]
    rightAscension = x[5]
    declination = x[6]
    startTime = seconds_since_epoch(x[3]);

    observations[startTime] = {
        target: target,
        startTime: startTime,
        endTime: seconds_since_epoch(x[4]),
        rightAscension: rightAscension,
        declination: declination,
        revolution: x[7]
    }

    if !targets.has_key? target
        targets[target] = { rightAscension: rightAscension, declination: declination }
    end

end

File.open(ARGV[0] + '.observations.json', 'w') { |file| file.write(observations.to_json) }
File.open(ARGV[0] + '.targets.json', 'w') { |file| file.write(targets.to_json) }